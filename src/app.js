// src/app.js

// Set the API URL, defaulting to localhost:8080 if not set in the environment
const apiUrl = process.env.API_URL || 'http://localhost:8080';

import { Auth, getUser } from './auth';
import { 
  getUserFragments, 
  postUserTypedFragments, 
  getExpandedUserFragments, 
  postUserSelectedFragments, 
  getFragmentsById, 
  putUserFragments, 
  deleteUserFragments 
} from './api';

async function updateUserFragments(user) {
  try {
    const userFragments = await getUserFragments(user);
    document.getElementById('currentFragment').innerText = JSON.stringify(userFragments, null, 4);
  } catch (error) {
    console.error("Error updating user fragments:", error);
    alert("Unable to fetch user fragments. Please try again.");
  }
}

async function showUserFragment(fragmentData, elementId) {
  document.getElementById(elementId).innerText = JSON.stringify(fragmentData, null, 4);
}

function handleAlert(message, error = null) {
  alert(message);
  if (error) console.error(message, error);
}

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  
  loginBtn.onclick = () => Auth.federatedSignIn();
  logoutBtn.onclick = () => Auth.signOut();

  const user = await getUser();
  if (!user) {
    logoutBtn.disabled = true;
    return;
  }

  console.log('Logged-in user:', user);
  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  await updateUserFragments(user);

  // Event Handlers for API calls
  document.querySelector('#getFragments').onclick = async () => {
    try {
      const userFragments = await getUserFragments(user);
      await showUserFragment(userFragments, 'currentFragment');
    } catch (error) {
      handleAlert("Failed to fetch fragments. Please try again.", error);
    }
  };

  document.querySelector('#getExpandedFragments').onclick = async () => {
    try {
      const expandedFragments = await getExpandedUserFragments(user, 1);
      await showUserFragment(expandedFragments, 'currentFragment');
    } catch (error) {
      handleAlert("Failed to fetch expanded fragments. Please try again.", error);
    }
  };

  document.querySelector('#getFragmentIdBtn').onclick = async () => {
    const fragmentId = document.querySelector('#fragmentId').value;
    try {
      const fragment = await getFragmentsById(user, fragmentId);
      await showUserFragment(fragment, 'currentFragmentWithId');
    } catch (error) {
      handleAlert("Failed to fetch fragment by ID. Please try again.", error);
    }
  };

  document.querySelector('#postFragmentBtn').onclick = async () => {
    const fragmentInput = document.querySelector('#fragmentInput').value;
    const selectedFile = document.querySelector('#selectedFile').files[0];
    const fragType = document.querySelector('#fragmentType').value;

    try {
      if (fragmentInput && fragmentInput !== 'Type Something here') {
        const fragData = await postUserTypedFragments(user, fragmentInput, fragType);
        alert('Fragment created successfully!');
        document.getElementById('fragLocation').value = `${apiUrl}/v1/fragments/${fragData.location}`;
        await updateUserFragments(user);
      } else if (selectedFile) {
        const fragData = await postUserSelectedFragments(user, selectedFile, fragType);
        alert('File fragment uploaded successfully!');
        document.getElementById('fragLocation').value = `${apiUrl}/v1/fragments/${fragData.location}`;
        await updateUserFragments(user);
      } else {
        alert('Please type a fragment or select a file to post.');
      }
    } catch (error) {
      handleAlert("Failed to post fragment. Please try again.", error);
    }
  };

  document.querySelector('#updateFragmentBtn').onclick = async () => {
    const updatedFragId = document.querySelector('#UpdatedFragId').value;
    const updatedFragData = document.querySelector('#UpdatedFragData').value;

    if (!updatedFragId) {
      alert('Please provide a fragment ID to update.');
      return;
    }

    try {
      await putUserFragments(user, updatedFragData, updatedFragId);
      alert('Fragment updated successfully!');
      await updateUserFragments(user);
    } catch (error) {
      handleAlert("Failed to update fragment. Please try again.", error);
    }
  };

  document.querySelector('#deleteFragBtn').onclick = async () => {
    const deleteFragId = document.querySelector('#deleteFragId').value;
    if (!deleteFragId) {
      alert('Please provide a fragment ID to delete.');
      return;
    }

    try {
      await deleteUserFragments(user, deleteFragId);
      alert('Fragment deleted successfully!');
      await updateUserFragments(user);
    } catch (error) {
      handleAlert("Failed to delete fragment. Please try again.", error);
    }
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);

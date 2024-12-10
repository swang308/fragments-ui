// src/app.js

// API URL for the fragments microservice, defaults to localhost if not set in the environment
const apiUrl = process.env.API_URL || 'http://localhost:8080';

import { Auth, getUser } from './auth';
import {
  getUserFragments,
  postUserTypedFragment,
  getExpandedUserFragments,
  postUserSelectedFragment,
  getFragmentWithId,
  putUserFragment,
  deleteUserFragment,
} from './api';

/**
 * Updates the UI with the user's fragments.
 * @param {Object} user - Authenticated user.
 */
async function updateUserFragments(user) {
  try {
    const userFragments = await getUserFragments(user);
    document.getElementById('currentFragment').innerText = JSON.stringify(userFragments, null, 4);
  } catch (err) {
    console.error('Error updating user fragments:', err);
    alert('Failed to update user fragments. Please try again.');
  }
}

/**
 * Initializes the application and sets up event listeners.
 */
async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Event handlers for login and logout
  loginBtn.onclick = () => Auth.federatedSignIn();
  logoutBtn.onclick = () => Auth.signOut();

  const user = await getUser();
  if (!user) {
    logoutBtn.disabled = true;
    return;
  }

  // Log user info and update UI
  console.log({ user });
  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  await updateUserFragments(user);

  // Event handler: GET /v1/fragments
  document.querySelector('#getFragments').onclick = async () => {
    try {
      const fragments = await getUserFragments(user);
      document.getElementById('currentFragment').innerText = JSON.stringify(fragments, null, 4);
      clearFragmentInputs();
    } catch {
      alert('Error fetching fragments. Please try again.');
    }
  };

  // Event handler: GET /v1/fragments?expand=1
  document.querySelector('#getExpandedFragments').onclick = async () => {
    try {
      const expandedFragments = await getExpandedUserFragments(user, 1);
      document.getElementById('currentFragment').innerText = JSON.stringify(expandedFragments, null, 4);
      clearFragmentInputs();
    } catch {
      alert('Error fetching expanded fragments. Please try again.');
    }
  };

  // Event handler: GET /v1/fragments/:id
  document.querySelector('#getFragmentIdBtn').onclick = async () => {
    const fragmentId = document.querySelector('#fragmentId').value;
    if (!fragmentId) {
      alert('Please enter a fragment ID.');
      return;
    }
    try {
      const fragment = await getFragmentWithId(user, fragmentId);
      document.getElementById('currentFragmentWithId').innerText = JSON.stringify(fragment, null, 4);
    } catch {
      alert('Error fetching fragment by ID. Please try again.');
    }
  };

  // Event handler: POST /v1/fragments (typed or file)
  document.querySelector('#postFragmentBtn').onclick = async () => {
    const fragmentText = document.querySelector('#fragmentInput').value.trim();
    const fragType = document.querySelector('#fragmentType').value;
    const selectedFile = document.querySelector('#selectedFile').files[0];

    if (fragmentText) {
      await postFragment(user, fragmentText, fragType);
    } else if (selectedFile) {
      await postFragmentFile(user, selectedFile, fragType);
    } else {
      alert('Please type a fragment or select a file to post.');
    }
  };

  // Event handler: PUT /v1/fragments/:id
  document.querySelector('#updateFragmentBtn').onclick = async () => {
    const fragmentId = document.querySelector('#UpdatedFragId').value.trim();
    const fragmentData = document.querySelector('#UpdatedFragData').value.trim();

    if (!fragmentId) {
      alert('Please enter a fragment ID to update.');
      return;
    }
    try {
      await putUserFragment(user, fragmentData, fragmentId);
      alert('Fragment updated successfully!');
      clearUpdateInputs();
      await updateUserFragments(user);
    } catch {
      alert('Error updating fragment. Please try again.');
    }
  };

  // Event handler: DELETE /v1/fragments/:id
  document.querySelector('#deleteFragBtn').onclick = async () => {
    const fragmentId = document.querySelector('#deleteFragId').value.trim();

    if (!fragmentId) {
      alert('Please enter a fragment ID to delete.');
      return;
    }

    try {
      await deleteUseFragment(user, fragmentId);
      alert('Fragment deleted successfully!');
      document.querySelector('#deleteFragId').value = '';
      await updateUserFragments(user);
    } catch {
      alert('Error deleting fragment. Please try again.');
    }
  };
}

/**
 * Clears inputs related to fragments.
 */
function clearFragmentInputs() {
  document.getElementById('fragLocation').value = '';
  document.getElementById('currentFragmentWithId').innerText = '';
  document.getElementById('fragmentId').value = '';
}

/**
 * Clears inputs for updating fragments.
 */
function clearUpdateInputs() {
  document.querySelector('#UpdatedFragId').value = '';
  document.querySelector('#UpdatedFragData').value = '';
}

/**
 * Posts a typed fragment.
 * @param {Object} user - Authenticated user.
 * @param {string} text - Fragment text.
 * @param {string} type - Fragment MIME type.
 */
async function postFragment(user, text, type) {
  try {
    const data = await postUserTypedFragment(user, text, type);
    alert('Fragment created successfully!');
    document.querySelector('#fragmentInput').value = '';
    document.getElementById('fragLocation').value = `${apiUrl}/${data.location}`;
    await updateUserFragments(user);
  } catch (err) {
    console.error('Error posting fragment:', err);
    alert('Failed to post fragment. Please try again.');
  }
}

/**
 * Posts a file fragment.
 * @param {Object} user - Authenticated user.
 * @param {File} file - Selected file.
 * @param {string} type - Fragment MIME type.
 */
async function postFragmentFile(user, file, type) {
  try {
    const data = await postUserSelectedFragment(user, file, type);
    alert('Fragment created successfully!');
    document.querySelector('#selectedFile').value = '';
    document.getElementById('fragLocation').value = `${apiUrl}/${data.location}`;
    await updateUserFragments(user);
  } catch (err) {
    console.error('Error posting file fragment:', err);
    alert('Failed to post file fragment. Please try again.');
  }
}

// Wait for the DOM to load, then initialize the app
document.addEventListener('DOMContentLoaded', init);

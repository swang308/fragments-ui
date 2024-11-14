// src/api.js

// Set the API URL, defaulting to localhost:8080 if not set in the environment
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Helper function to handle errors and log messages consistently.
 * @param {Response} res - The fetch response object
 * @param {string} operation - Description of the API operation being performed
 */
function handleError(res, operation) {
  console.error(`Error during ${operation}: ${res.status} ${res.statusText}`);
  throw new Error(`${res.status} ${res.statusText}`);
}

/**
 * Fetches all fragments for the authenticated user.
 * @param {Object} user - Authenticated user object with authorization headers
 */
export async function getUserFragments(user) {
  console.log('Fetching user fragments...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, { headers: user.authorizationHeaders() });
    if (!res.ok) handleError(res, 'fetching user fragments');
    
    const data = await res.json();
    console.log('Successfully fetched user fragments:', data);
    return data;
  } catch (error) {
    console.error('Unable to fetch user fragments:', error);
    throw error;
  }
}

/**
 * Fetches expanded fragments for the authenticated user.
 * @param {Object} user - Authenticated user object
 * @param {number} expand - Parameter to expand fragment details
 */
export async function getExpandedUserFragments(user, expand) {
  console.log('Fetching expanded user fragments...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, { headers: user.authorizationHeaders() });
    if (!res.ok) handleError(res, 'fetching expanded user fragments');
    
    const data = await res.json();
    console.log('Successfully fetched expanded fragments:', data);
    return data;
  } catch (error) {
    console.error('Unable to fetch expanded fragments:', error);
    throw error;
  }
}

/**
 * Fetches a specific fragment by ID.
 * @param {Object} user - Authenticated user object
 * @param {string} fragmentId - ID of the fragment to fetch
 */
export async function getFragmentsById(user, fragmentId) {
  console.log(`Fetching fragment with ID: ${fragmentId}`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, { headers: user.authorizationHeaders() });
    if (!res.ok) handleError(res, `fetching fragment with ID: ${fragmentId}`);
    
    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await res.json() : await res.text();
    console.log(`Successfully fetched fragment with ID ${fragmentId}:`, data);
    return data;
  } catch (error) {
    console.error(`Unable to fetch fragment with ID ${fragmentId}:`, error);
    throw error;
  }
}

/**
 * Creates a new fragment with typed text content.
 * @param {Object} user - Authenticated user object
 * @param {string} fragmentText - Text content for the fragment
 * @param {string} fragType - MIME type of the fragment (e.g., 'text/plain')
 */
export async function postUserTypedFragments(user, fragmentText, fragType) {
  console.log('Posting new text fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        ...user.authorizationHeaders(),
        'Content-Type': fragType,
      },
      body: fragmentText,
    });
    if (!res.ok) handleError(res, 'posting typed fragment');
    
    const data = await res.json();
    console.log("Successfully posted text fragment:", data);
    return data;
  } catch (error) {
    console.error('Unable to post typed fragment:', error);
    throw error;
  }
}

/**
 * Uploads a selected file as a fragment.
 * @param {Object} user - Authenticated user object
 * @param {File} selectedFile - File object to be uploaded
 * @param {string} fragType - MIME type of the file (e.g., 'image/png')
 */
export async function postUserSelectedFragments(user, selectedFile, fragType) {
  console.log('Uploading selected file as fragment...');
  const formData = new FormData();
  formData.append("file", selectedFile);
  
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: user.authorizationHeaders(),
      body: formData,
    });
    if (!res.ok) handleError(res, 'posting file fragment');
    
    const data = await res.json();
    console.log("Successfully uploaded file fragment:", data);
    return data;
  } catch (error) {
    console.error('Unable to post file fragment:', error);
    throw error;
  }
}

/**
 * Updates an existing fragment by ID.
 * @param {Object} user - Authenticated user object
 * @param {string} updatedText - Updated text content for the fragment
 * @param {string} updatedID - ID of the fragment to update
 */
export async function putUserFragments(user, updatedText, updatedID) {
  console.log(`Updating fragment with ID: ${updatedID}`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${updatedID}`, {
      method: 'PUT',
      headers: user.authorizationHeaders(),
      body: updatedText,
    });
    if (!res.ok) handleError(res, `updating fragment with ID: ${updatedID}`);
    
    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await res.json() : await res.text();
    console.log(`Successfully updated fragment with ID ${updatedID}:`, data);
    return data;
  } catch (error) {
    console.error(`Unable to update fragment with ID ${updatedID}:`, error);
    throw error;
  }
}

/**
 * Deletes a fragment by ID.
 * @param {Object} user - Authenticated user object
 * @param {string} deleteFragId - ID of the fragment to delete
 */
export async function deleteUserFragments(user, deleteFragId) {
  console.log(`Deleting fragment with ID: ${deleteFragId}`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${deleteFragId}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) handleError(res, `deleting fragment with ID: ${deleteFragId}`);
    
    const data = await res.json();
    console.log(`Successfully deleted fragment with ID ${deleteFragId}:`, data);
    return data;
  } catch (error) {
    console.error(`Unable to delete fragment with ID ${deleteFragId}:`, error);
    throw error;
  }
}

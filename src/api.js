// src/api.js

// Determine the API URL from environment variables or default to localhost
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Fetch all fragments for the authenticated user.
 * @param {Object} user - Authenticated user with an `idToken`.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully retrieved user fragments', { data });
    return data;
  } catch (err) {
    console.error('Failed to fetch user fragments', { err });
    throw err;
  }
}

/**
 * Fetch fragments with the option to expand data.
 * @param {Object} user - Authenticated user.
 * @param {boolean} expand - Whether to expand the fragments data.
 */
export async function getExpandedUserFragments(user, expand) {
  console.log('Requesting expanded user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=${expand}`, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully retrieved expanded user fragments', { data });
    return data;
  } catch (err) {
    console.error('Failed to fetch expanded fragments', { err });
    throw err;
  }
}

/**
 * Fetch a specific fragment by its ID.
 * @param {Object} user - Authenticated user.
 * @param {string} fragmentId - ID of the fragment to fetch.
 */
export async function getFragmentWithId(user, fragmentId) {
  console.log('Fetching fragment by ID...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
      },
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type');
    return contentType?.includes('application/json')
      ? await res.json()
      : await res.text();
  } catch (err) {
    console.error('Failed to fetch fragment by ID', { err });
    throw err;
  }
}

/**
 * Post a typed fragment.
 * @param {Object} user - Authenticated user.
 * @param {string} fragmentText - Text of the fragment.
 * @param {string} fragType - MIME type of the fragment.
 */
export async function postUserTypedFragment(user, fragmentText, fragType) {
  console.log('Posting a typed fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': fragType,
      },
      body: fragmentText,
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    // Extract the Location header
    const location = res.headers.get('Location');
    if (!location) {
      console.warn('Location header is missing in the response.');
    }

    const data = await res.json();
    console.log('Fragment posted successfully', { data });

    // Return both the data and location
    return { data, location };
  } catch (err) {
    console.error('Failed to post typed fragment', { err });
    throw err;
  }
}

/**
 * Post a file fragment.
 * @param {Object} user - Authenticated user.
 * @param {File} selectedFile - File to upload.
 * @param {string} fragType - MIME type of the file.
 */
export async function postUserSelectedFragment(user, selectedFile, fragType) {
  console.log('Posting a file fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
        'Content-Type': fragType,
      },
      body: selectedFile,
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    // Extract the Location header
    const location = res.headers.get('Location');
    if (!location) {
      console.warn('Location header is missing in the response.');
    }

    const data = await res.json();
    console.log('File fragment posted successfully', { data });

    // Return both the data and location
    return { data, location };
  } catch (err) {
    console.error('Failed to post file fragment', { err });
    throw err;
  }
}

/**
 * Update an existing fragment.
 * @param {Object} user - Authenticated user.
 * @param {string} updatedText - Updated content of the fragment.
 * @param {string} updatedID - ID of the fragment to update.
 */
export async function putUserFragment(user, updatedText, updatedID) {
  console.log('Updating fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${updatedID}`, {
      method: 'PUT',
      headers: {
        Authorization: user.authorizationHeaders().Authorization,
      },
      body: updatedText,
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type');
    return contentType?.includes('application/json')
      ? await res.json()
      : await res.text();
  } catch (err) {
    console.error('Failed to update fragment', { err });
    throw err;
  }
}

/**
 * Delete a fragment by ID.
 * @param {Object} user - Authenticated user.
 * @param {string} deleteFragId - ID of the fragment to delete.
 */
export async function deleteUserFragment(user, deleteFragId) {
  console.log('Deleting fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${deleteFragId}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    console.log('Fragment deleted successfully');
  } catch (err) {
    console.error('Failed to delete fragment', { err });
    throw err;
  }
}

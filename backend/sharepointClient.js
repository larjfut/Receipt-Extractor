const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

// Read configuration from environment variables.  These values must be
// provided by the operator to enable calls to Microsoft Graph.  When not
// configured the client will operate in stub mode.
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const siteId = process.env.SITE_ID;
const listId = process.env.LIST_ID;

/**
 * Obtain an authenticated Microsoft Graph client using the client
 * credentials flow.  This requires the Azure application to have the
 * appropriate permissions (e.g. `Sites.ReadWrite.All`) and for a secret to
 * be configured in Azure AD.  See the README for details.
 */
function getGraphClient() {
  if (!tenantId || !clientId || !clientSecret) {
    return null;
  }
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });
}

/**
 * Create a new item in the SharePoint list using the Graph API.  The
 * `fields` object is keyed by stateKey; this function must translate it
 * into SharePoint internal names (see fieldMapping.json).  Attachments and
 * signature are optional and may be uploaded after the list item is
 * created.  When Graph credentials are not configured, this function logs
 * the request and returns a stub response.
 *
 * @param {Object} fields An object keyed by stateKey containing user
 *   populated values.
 * @param {Array} attachments An array of objects describing uploaded files.
 * @param {string|null} signature A base64 data URL of the signature image.
 */
async function createPurchaseRequisition(fields, attachments, signature) {
  // If Graph is not configured, just return a stub response.  This makes it
  // safe to develop the frontend without needing credentials.
  const graph = getGraphClient();
  if (!graph || !siteId || !listId) {
    console.log('SharePoint client not configured.  Skipping actual submission.');
    console.log('Fields:', fields);
    console.log('Attachments:', attachments);
    console.log('Signature present:', Boolean(signature));
    return { status: 'stub', message: 'SharePoint not configured' };
  }
  // Build the fields payload for the list item.  SharePoint expects the
  // dictionary to be keyed by internal column names.  For this example we
  // simply copy the provided fields assuming the keys have already been
  // translated into internal names on the client.  See README for details.
  const itemPayload = {
    fields: { ...fields },
  };
  try {
    // Create the list item
    const item = await graph
      .api(`/sites/${siteId}/lists/${listId}/items`)
      .post(itemPayload);
    // Upload attachments if provided
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        // In a real implementation you would read the file content and
        // upload it as an attachment to the list item
        await graph
          .api(`/sites/${siteId}/lists/${listId}/items/${item.id}/attachments`)
          .post({
            '@microsoft.graph.downloadUrl': file.contentUrl,
            'name': file.name,
            'contentType': file.type,
          });
      }
    }
    return item;
  } catch (err) {
    console.error('Error creating SharePoint item:', err);
    throw err;
  }
}

module.exports = { createPurchaseRequisition };

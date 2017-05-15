var carbon = require('carbon-io')
var HttpErrors = carbon.HttpErrors
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var _      = require('lodash')

/**********************************************************************************************************************
 * ContactsEndpoint
 *
 * This is the /users/:user/contacts Endpoint. It is a Collection.
 *
 */
module.exports = o({

  /****************************************************************************************************************
   * _type
   */
  _type: carbon.carbond.collections.Collection,

  /****************************************************************************************************************
   * enabled
   */
  enabled: {
    insert: true,
    find: true,
    update: false,       // We do not support bulk updates to this collection
    remove: false,       // We do not support bulk removes to this collection
    saveObject: true,
    findObject: true,
    updateObject: false, // We do not allow for updates, only saving back the whole object.
    removeObject: true,
  },

  /****************************************************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Users.
   */
  collection: 'contact',

  /****************************************************************************************************************
   * schema
   *
   * Schema for the API interface to Contacts. Notice this is not the same as the db schema and does not include
   * the user field.
   */
  schema: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phoneNumbers: {
        type: 'object',
        properties: {
          home: { type: 'string' },
          work: { type: 'string' },
          mobile: { type: 'string' }
        },
      },
    },
    required: [ '_id', 'firstName' ],
    additionalProperties: false
  },

  /****************************************************************************************************************
   * acl
   *
   * Acl for this Collection endpoint. Note that the parent Endpoint of this Endpoint, the UsersEndpoint,
   * defines an acl that ensures the authenticated user is the same as the user in the path or is an admin,
   * which also governs access to this Endpoint.
   */
  acl: o({
    _type: carbon.carbond.security.CollectionAcl,

    groupDefinitions: {
      admin: 'admin'
    },

    entries: [
      {
        // Admin user -- grant all permissions
        user: { admin: true },
        permissions: {
          '*': true
        }
      },

      {
        // All other Users
        user: '*',
        permissions: {
          insert: true,
          find: true,
          findObject: true,
          saveObject: true,
          removeObject: true,
          '*': false // Not strictly needed as the default for permissions is false.
        }
      }
    ]

  }),

  /****************************************************************************************************************
   * idGenerator
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /****************************************************************************************************************
   * insert
   */
  insert: function(obj, reqCtx) {
    obj.user = reqCtx.req.parameters.user // Set the contacts user field to the authenticated user id
    var result = this.getCollection().insertObject(obj)
    return this._publicView(result)
  },

  /****************************************************************************************************************
   * findConfig
   */
  findConfig: {
    supportsQuery: true,
    querySchema: {
      type: 'string', // Allows for ?query=<string> which will search for a match in firstName, lastName, and email.
    }
  },

  /****************************************************************************************************************
   * find
   *
   * Supports an optional query. Returns the entire set of matching contacts as an array. No pagination is used,
   * as this dataset should be relatively small.
   */
  find: function(query, reqCtx) {
    var self = this
    var userId = reqCtx.req.parameters.user

    var result = []
    if (query) {

      result = this.getCollection().find({ $or: [{ firstName: query }, // We could get fancier and use regex searches
                                                 { lastName: query },
                                                 { email: query }],
                                           user: userId }).sort({ firstName: 1 }).toArray()
    } else {
      result = this.getCollection().find({ user: userId }).sort({ firstName: 1 }).toArray()
    }

    result = _.map(result, function(contact) {
      return self._publicView(contact)
    })

    return result
  },

  /****************************************************************************************************************
   * saveObject
   */
  saveObject: function(obj, reqCtx) {
    // Security Note: This is secured by virtue of the CollectionAcl defined
    // on this Collection endpoint which ensures this id is the same as the
    // authenticated User's _id or the User is an admin.

    // Make sure this points to right user by setting the user field to the authenticated user.
    obj.user = reqCtx.req.parameters.user

    // Be careful not to call save() or saveObject() on the database collection here. Those methods allow
    // for upsert which we do not want since we do not want clients to be able to create new contacts this
    // way. We want to be in control of
    // the _id values.
    try {
      return this.getCollection().updateObject(obj._id, obj)
    } catch (e) {
      throw new HttpErrors.NotFound(obj._id) // XXX or should we return the object and if one is not returned it is 404
    }
  },

  /****************************************************************************************************************
   * findObject
   */
  findObject: function(id) {
    // Security Note: This is secured by virtue of the CollectionAcl defined
    // on this Collection endpoint which ensures this id is the same as the
    // authenticated User's _id or the User is an admin.
    var result = this.getCollection().findOne({ _id: id })
    return this._publicView(result)
  },

  /****************************************************************************************************************
   * removeObject
   */
  removeObject: function(id) {
    // Security Note: This is secured by virtue of the CollectionAcl defined
    // on this Collection endpoint which ensures this id is the same as the
    // authenticated User's _id or the User is an admin.
    try {
      return this.getCollection().removeObject(id)
    } catch (e) {
      throw new HttpErrors.NotFound(id) // XXX or should we return the object and if one is not returned it is 404
    }
  },

  /****************************************************************************************************************
   * getCollection
   */
  getCollection: function() {
    return this.service.db.getCollection(this.collection)
  },

  /****************************************************************************************************************
   * _publicView
   */
  _publicView: function(obj) {
    var result = {
      _id: obj._id,
      phoneNumbers: obj.phoneNumbers || {}
    }

    if (obj.firstName) {
      result.firstName = obj.firstName
    }

    if (obj.lastName) {
      result.lastName = obj.lastName
    }

    if (obj.email) {
      result.email = obj.email
    }

    return result
  }

})

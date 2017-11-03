var carbon = require('carbon-io')
var HttpErrors = carbon.HttpErrors
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var _      = require('lodash')

/***************************************************************************************************
 * ContactsEndpoint
 *
 * This is the /users/:user/contacts Endpoint. It is a Collection.
 *
 */
module.exports = o({

  /*****************************************************************************
   * _type
   */
  _type: carbon.carbond.mongodb.MongoDBCollection,

  /*****************************************************************************
   * enabled
   */
  enabled: {
    insert: false,       // We do not support bulk inserts to this collection
    find: true,
    save: false,         // We do not support bulk replace of this collection
    update: false,       // We do not support bulk updates to this collection
    remove: false,       // We do not support bulk removes to this collection
    insertObject: true,
    saveObject: true,
    findObject: true,
    updateObject: false, // We do not allow for updates, only saving back the whole object.
    removeObject: true,
  },

  /*****************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Contacts.
   */
  collection: 'contacts',

  /*****************************************************************************
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

  /*****************************************************************************
   * acl
   *
   * Acl for this Collection endpoint. Note that the parent Endpoint of this Endpoint, the UsersEndpoint,
   * defines an acl that also governs this Endpoint which ensures the authenticated user is the same as the userId
   * in the path.
   */
  acl: o({
    _type: carbon.carbond.security.CollectionAcl,

    entries: [
      {
        // All Users
        user: '*',
        permissions: {
          find: true,
          insertObject: true,
          findObject: true,
          saveObject: true,
          removeObject: true,
          '*': false // Not strictly needed as the default for permissions is false.
        }
      }
    ]

  }),

  /*****************************************************************************
   * idGenerator
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /*****************************************************************************
   * insertObjectConfig
   */
  insertObjectConfig: {
    returnsInsertedObject: true
  },

  /*****************************************************************************
   * preInsertObject
   */
  preInsertObject: function(object, context) {
    object.user = context.user // Set the contacts user field to the authenticated user id
  },

  /*****************************************************************************
   * postInsertObject
   */
  postInsertObject: function(result) {
    return this._publicView(result)
  },

  /*****************************************************************************
   * findConfig
   */
  findConfig: {
    supportsQuery: true,
    supportsPagination: false,
    queryParameter: {
      query: {
        schema: {type: 'string'},
        location: 'query',
        required: false,
        default: undefined
      }
    }
  },

  /*****************************************************************************
   * preFind
   *
   * Supports an optional query. Returns the entire set of matching contacts as an array. No pagination is used,
   * as this dataset should be relatively small.
   */
  preFind: function(context) {
    if (_.isEqual(context.query, {})) {
      context.query = {user: context.user}
    } else {
      context.query = {
        $or: [
          {firstName: context.query}, // We could get fancier and use regex searches
          {lastName: context.query},
          {email: context.query}
        ],
        user: context.user
      }
    }
    // This overrides any sort that the user may submit
    context.sort = {firstName: 1}
  },

  /*****************************************************************************
   * preFind
   *
   */
  postFind: function(result) {
    var self = this
    return _.map(result, function(contact) {
      return self._publicView(contact)
    })
  },

  /*****************************************************************************
   * saveObjectConfig
   */
  saveObjectConfig: {
    // We do not want clients to be able to create new contacts this way. We want to be in control
    // of the _id values.
    supportsInsert: false
  },

  /*****************************************************************************
   * preSaveObject
   *
   * Security Note: This is secured by virtue of the CollectionAcl defined
   * on our parent Collection endpoint which ensures this id is the same as the
   * authenticated User's _id.
   */
  preSaveObject: function(object, context) {
    // Make sure this points to right user by setting the user field to the authenticated user.
    object.user = context.user
  },

  /*****************************************************************************
   * postSaveObject
   *
   * Security Note: This is secured by virtue of the CollectionAcl defined
   * on our parent Collection endpoint which ensures this id is the same as the
   * authenticated User's _id or the User.
   */
  postSaveObject: function(result) {
    return {
      val: this._publicView(result.val),
      created: result.created
    }
  },

  /*****************************************************************************
   * postFindObject
   *
   * Security Note: This is secured by virtue of the CollectionAcl defined
   * on our parent Collection endpoint which ensures this id is the same as the
   * authenticated User's _id or the User.
   */
  postFindObject: function(result) {
    return this._publicView(result)
  },

  /*****************************************************************************
   * removeObject
   *
   * Security Note: This is secured by virtue of the CollectionAcl defined
   * on our parent Collection endpoint which ensures this id is the same as the
   * authenticated User's _id.
   */

  /*****************************************************************************
   * getCollection
   */
  getCollection: function() {
    return this.service.db.getCollection(this.collection)
  },

  /*****************************************************************************
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

var carbon   = require('carbon-io')
var o        = carbon.atom.o(module)
var _o       = carbon.bond._o(module)
var _        = require('lodash')

/***************************************************************************************************
 * UsersEndpoint
 *
 * This is the /users Endpoint. It is a Collection. It is also the root
 * endpoint for all other endpoints (i.e. /users/:user/contacts)
 *
 * One core function of the Endpoint is to enforce the security contraint
 * that req.user._id === :user for all sub-endpoints. It does this via an
 * acl that is a CollectionAcl with 'selfAndBelow' set to true.
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
    find: false,
    save: false,        // We do not support bulk replace of this collection
    update: false,      // We do not support bulk updates to this collection
    remove: false,      // We do not support bulk removes to this collection
    insertObject: true,
    findObject: true,
    saveObject: false,
    updateObject: true, // We do not allow for saving the whole object, only select updates
    removeObject: true,
  },

  /*****************************************************************************
   * idPathParameter
   *
   * This is how we identify the path parameter (e.g., :user in /users/:user) to use as
   * the id on this collection.
   */
  idPathParameter: 'user',

  /****************************************************************************************************************
   * allowUnauthenticated
   *
   * This disables authentication for POST requests. It lets us create new users.
   */
  allowUnauthenticated: ['post'],

  /*****************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Users.
   */
  collection: 'users',

  /*****************************************************************************
   * schema
   *
   * This is the schema for User objects handled by this Endpoint. Schema for insert will differ from this
   * allowing only for a subset of the User fields to be defined by clients.
   */
  schema: {
    type: "object",
    properties: {
      _id: {type: 'string'},
      email: {type: 'string', format: 'email'},
    },
    required: ['_id', 'email'],
    additionalProperties: false
  },

  /*****************************************************************************
   * acl
   *
   * This acl ensures that the entire /users/:user subtree disallows access unless the
   * authenticated user owns the User.
   */
  acl: o({
    _type: carbon.carbond.security.CollectionAcl,

    selfAndBelow: 'findObject', // Govern this Endpoint and all descendant Endpoints. Very important.

    entries: [
      {
        // All users
        user: '*',
        permissions: {
          // For all operations, make sure the user id is the same as the authenticated user
          '*': function(user, env) {
            var userId = env.req.parameters['user']
            if (userId) {
              return user._id === userId
            }

            // If there is no userId parameter, this is a collection-level operation.
            // We return false here to prevent a user from listing all users
            // or executing other collection level operations.
            return false
          }
        }
      }
    ]

  }),

  /*****************************************************************************
   * idGenerator
   *
   * By configuring an idGenerator for this Collection we can control the _id values created for new objects
   * as they are inserted. Here we choose an IdGenerator to generate MongoDB ObjectId values but as strings instead
   * of native ObjectIds, which can be cumbersome for a public API as the client has to deal with EJSON encoding.
   * Our _id values will be strings.
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /*****************************************************************************
   * passwordHasher
   */
  passwordHasher: o({
    _type: carbon.carbond.security.BcryptHasher,
  }),

  /*****************************************************************************
   * endpoints
   *
   * SECURITY: It is semantically important that these are defined as child
   * Endpoints of this Endpoint so that the acl for this Endpoint will govern
   * them. If these definitions were moved to top-level, for instance, this
   * would not be the case.
   */
  endpoints: {
    contacts: _o('./ContactsEndpoint')
  },

  /*****************************************************************************
   * insertObjectConfig
   */
  insertObjectConfig: {
    allowUnauthenticated: true, // This operation disables authentication. It is how new users are made.

    // This is the schema for posting to /users. New users simply post email and password.
    insertObjectSchema: {
      type: "object",
      properties: {
        email: {type: 'string', format: 'email'},
        password: {type: 'string'},
      },
      required: ['email', 'password'],
      additionalProperties: false
    },
    returnsInsertedObject: true
  },

  /*****************************************************************************
   * preInsertObject
   */
  preInsertObject: function(object) {
    var user = {
      _id: object._id, // Since we have an idGenerator an _id will already have been generated for the new obj
      email: object.email,
      password: this.passwordHasher.hash(object.password)
    }

    // Check for existing user. In a real production app you will want a unique index on email.
    var existingUser = this.getCollection().findOne({email: object.email})
    if (existingUser) {
      throw new carbon.HttpErrors.Conflict("User exists with this email")
    }

    return {
      object: user
    }
  },

  /*****************************************************************************
   * preInsertObject
   */
  postInsertObject: function(result) {
    return this.publicUserView(result)
  },

  /*****************************************************************************
   * postFindObject
   *
   * SECURITY: This is secured by virtue of the CollectionAcl defined
   * on this Collection endpoint which ensures this id (/users/:id) is the same as the
   * authenticated User's _id.
   */
  postFindObject: function(result) {
    return this.publicUserView(result, true)
  },

  /*****************************************************************************
   * updateObjectConfig
   *
   * SECURITY: This is secured by virtue of the CollectionAcl defined
   * on this Collection endpoint which ensures this id (/users/:id) is the same as the
   * authenticated User's _id.
   */
  updateObjectConfig: {
    supportsUpsert: false,
    // For security reasons it is important to only allow the user to update some fields.
    updateSchema: {
      type: "object",
      properties: {
        password: { type: 'string' },
        email: { type: 'string', format: 'email' }
      },
      additionalProperties: false
    }
  },

  /*****************************************************************************
   * preUpdateObject
   *
   * SECURITY: This is secured by virtue of the CollectionAcl defined
   * on this Collection endpoint which ensures this id (/users/:id) is the same as the
   * authenticated User's _id.
   */
  preUpdateObject: function(id, update) {
    // If password is being reset, hash it like we did when we inserted.
    if (update.password) {
      update.password = this.passwordHasher.hash(update.password)
    }
    return {
      id: id,
      update: {$set: update}
    }
  },

  /*****************************************************************************
   * removeObject
   *
   * SECURITY: This is secured by virtue of the CollectionAcl defined
   * on this Collection endpoint which ensures this id (/users/:id) is the same as the
   * authenticated User's _id.
   */

  /*****************************************************************************
   * getCollection
   */
  getCollection: function() {
    return this.service.db.getCollection(this.collection)
  },

  /*****************************************************************************
   * publicUserView
   */
  publicUserView: function(obj) {
    var result = {
      _id: obj._id,
      email: obj.email
    }

    return result
  }

})

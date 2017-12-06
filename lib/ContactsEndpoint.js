var carbon = require('carbon-io')
var HttpErrors = carbon.HttpErrors
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)

/***************************************************************************************************
 * ContactsEndpoint
 *
 * This is the /contacts Endpoint. It is a MongoDBCollection. Collections have 10 operation
 * handlers such as insert, findObject, and removeObject. This collection demonstrates the
 * config options for each of the 10 operation handlers.
 *
 * You can configure the operation handlers using properties on the MongoDBCollection class such as
 * insertConfig, findObjectConfig, and removeObjectConfig. Each config property is an object
 * containing several fields. Some fields are shared by all the config objects. Some are specific to
 * certain configs. Here are the fields shared by all of them:
 *
 *    options               - An object of options that should be passed into the handler
 *                            as part of the options argument.
 *
 *    parameters            - An object of parameters which will be passed to handlers via the options argument.
 *                            See the documentation to learn about the structure of operation parameters:
 *                            https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.OperationParameter.html
 *
 *    allowUnauthenticated  - Allows unauthenticated requests to the resource if true.
 *
 *    description           - A brief description of the operation used by the documentation
 *                            generator.
 *
 *    example               - An example response body for documentation.
 *
 *    noDocument            - Documentation won't be generated for this operation if noDocument is true.
 *
 *    responses             - Custom responses for this operation. Will override all default responses.
 *
 *    driverOptions         - The MongoDB driver options to be sent to the MongoDB driver during the request.
 *
 * For more details on the configuration options, see the documentation here:
 * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.collections.CollectionOperationConfig.html
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
    insert:       true,
    find:         true,
    save:         true,
    update:       true,
    remove:       true,
    insertObject: true,
    saveObject:   true,
    findObject:   true,
    updateObject: true,
    removeObject: true
  },

  /*****************************************************************************
   * collection
   *
   * The name of the MongoDB collection storing Contacts.
   */
  collection: 'contacts',
  
  /*****************************************************************************
   * idParameter
   *
   * The name of the id parameter in the collection (_id is the default).
   */
  idParameter: '_id',

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
      phoneMobile: { type: 'string' },
      phoneWork: { type: 'string' }
    },
    required: [ '_id', 'firstName' ],
    additionalProperties: false
  },

  /*****************************************************************************
   * idGenerator
   */
  idGenerator: o({
    _type: carbon.carbond.ObjectIdGenerator,
    generateStrings: true
  }),

  /*****************************************************************************
   * insertConfig
   *
   * These are the default values for the insertConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   * Properties specific to insertConfig (see top of the file for properties shared by all configs):
   *
   *    insertSchema           - The schema used to validate the request body. If this is undefined,
   *                             the collection level schema (adapted for arrays) will be used.
   *
   *    returnsInsertedObjects - If true, the server will respond to the request with the objects
   *                             that were insterted.
   *
   * For a detailed description of the fields, view the insertConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBInsertConfig.html
   */
  insertConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    insertSchema: undefined,
    noDocument: false,
    responses: {},
    returnsInsertedObjects: true
  },

  /*****************************************************************************
   * findConfig
   *
   * These are the default values for the findConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    maxPageSize             - Maximum number of documents returned per page if pagination
   *                              is enabled.
   *
   *    pageSize                - Default number of documents returned per page if pagination
   *                              is enabled.
   *
   *    parameters              - An object of parameters which will be passed to handlers via the options argument.
   *                              Add more parameters by adding properties to this object. Default parameters:
   *
   *                              page                - A whole number which requests a particular page
   *                                                    in pagination. The default is 0. Corresponds to skip.
   *
   *                              pageSize            - A whole number which defines how many documents should
   *                                                    be returned per page. The default is 0 which represents the
   *                                                    default MongoDB batch size of 101 documents. It will not
   *                                                    return more than maxPageSize. Corresponds to limit.
   *
   *                              skip                - A whole number which defines how many documents should
   *                                                    be skipped in the result. The default is 0.
   *
   *                              limit               - A whole number which defines how many documents should
   *                                                    be returned per batch. The default is 0 which represents the
   *                                                    default MongoDB batch size of 101 documents. It will not
   *                                                    return more than maxPageSize.
   *
   *                              [this.idParameter]  - The id parameter will filter results by the id. Its key
   *                                                    is the idParameter defined on the collection (default is _id).
   *
   *                              sort                - A sort document to be passed to the MongoDB driver.
   *
   *                              projection          - A projection document to be passed to the MongoDB driver.
   *
   *                              query               - A filter document to be passed to the MongoDB driver.
   *
   *    supportsSkipAndLimit    - Skip and limit will be supported if set to true.
   *
   *    supportsPagination      - Pagination (with the page and pageSize parameters) will be supported if true.
   *
   *    supportsIdQuery         - Filtering by the id parameter will be supported if true.
   *
   * For a detailed description of the fields, view the findConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBFindConfig.html
   */
  findConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    maxPageSize: undefined,
    noDocument: false,
    pageSize: 50,
    parameters: {
      page: {
        description: 'The page to navigate to (skip/limit are derived from this)',
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false,
        default: 0
      },
      pageSize: {
        description: 'The page size used for pagination (skip/limit are derived from this and page)',
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      },
      skip: {
        description: 'The number of objects to skip when iterating pages',
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      },
      limit: {
        description: 'The maximum number of objects for a given page',
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      },
      [this.idParameter]: {
        description: 'Id query parameter',
        schema: {
          oneOf: [
            {type: 'string'},
            {
              type: 'array',
              items: {type: 'string'}
            }
          ]
        },
        location: 'query',
        required: false
      },
      sort: {
        description: 'Sort spec (JSON)',
        location: 'query',
        schema: {
          type: 'object'
        },
        required: false
      },
      projection: {
        description: 'Projection spec (JSON)',
        location: 'query',
        schema: {
          type: 'object',
          additionalProperties: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            multipleOf: 1
          }
        },
        required: false
      },
      query: {
        description: 'Query spec (JSON)',
        schema: {type: 'object'},
        location: 'query',
        required: false,
        default: {}
      }
    },
    responses: {},
    supportsSkipAndLimit: true,
    supportsPagination: false,
    supportsIdQuery: true
  },

  /*****************************************************************************
   * saveConfig
   *
   * These are the default values for the saveConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    returnsSavedObjects   - The response will contain the saved objects if true.
   *
   *    saveSchema            - The schema used to validate the request body. If this is
   *                            undefined, the collection level schema (adapted for arrays)
   *                            will be used.
   *
   * For a detailed description of the fields, view the saveConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBSaveConfig.html
   */
  saveConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    noDocument: false,
    responses: {},
    returnsSavedObjects: true,
    saveSchema: undefined
  },


  /****************************************************************************
   * updateConfig
   *
   * These are the default values for the updateConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    parameters              - An object of parameters which will be passed to handlers via the options argument.
   *                              Add more parameters by adding properties to this object. Default parameters:
   *
   *                              query   - A filter document to be passed to the MongoDB driver.
   *
   *                              update  - The update document to be passed to the MongoDB driver.
   *
   *                              upsert  - A parameter to turn upsert on. If set to true, this will override
   *                                        supportsUpsert.
   *
   *    supportsQuery           - Filtering by the query parameter will be supported if true.
   *
   *    supportsUpsert          - If set to true, update will create objects in the collection if
   *                              they don't already exist.
   *
   *    updateSchema            - The schema used to validate the request body. If this is
   *                              undefined, the collection level schema (adapted for arrays)
   *                              will be used.
   *
   * For a detailed description of the fields, view the updateConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBUpdateConfig.html
   *
   */
  updateConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    noDocument: false,
    parameters: {
      query: {
        description: 'Query spec (JSON)',
        schema: {type: 'object'},
        location: 'query',
        required: false,
        default: {}
      },
      update: {
        description: 'The update spec',
        location: 'body',
        required: true,
        schema: undefined
      },
      upsert: {
        description: 'Enable upsert',
        location: 'query',
        schema: {
          oneOf: [
            {type: 'boolean', default: false},
            {
              type: 'number',
              maximum: 1,
              minimum: 0,
              multipleOf: 1,
            }
          ]
        },
        required: false,
        default: false
      }
    },
    responses: {},
    // returnsUpsertedObjects: false, // This is not configurable on MongoDBCollection. It will always be false.
    supportsQuery: true,
    supportsUpsert: false,
    updateSchema: undefined
  },

  /*****************************************************************************
   * removeConfig
   *
   * These are the default values for the removeConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    parameters              - An object of parameters which will be passed to handlers via the options argument.
   *                              Add more parameters by adding properties to this object. Default parameters:
   *
   *                              query   - A filter document to be passed to the MongoDB driver.
   *
   *    supportsQuery           - Filtering by the query parameter will be supported if true.
   *
   * For a detailed description of the fields, view the removeConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBRemoveConfig.html
   *
   */
  removeConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    noDocument: false,
    parameters: {
      query: {
        description: 'Query spec (JSON)',
        schema: {type: 'object'},
        location: 'query',
        required: false,
        default: {}
      }
    },
    responses: {},
    // returnsRemovedObjects: false, // This is not configurable on MongoDBCollection. It will always be false.
    supportsQuery: true
  },

  /*****************************************************************************
   * insertObjectConfig
   *
   * These are the default values for the insertObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    insertObjectSchema    - The schema used to validate the request body. If this is
   *                            undefined, the collection level schema (adapted for arrays)
   *                            will be used.
   *
   *    returnsInsertedObject - The response will contain the inserted object if true.
   *
   * For a detailed description of the fields, view the insertObjectConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBInsertObjectConfig.html
   *
   */
  insertObjectConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    insertObjectSchema: undefined,
    noDocument: false,
    responses: {},
    returnsInsertedObject: true
  },

  /*****************************************************************************
   * findObjectConfig
   *
   * These are the default values for the findObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   * For a detailed description of the fields, view the findObjectConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBFindObjectConfig.html
   *
   */
  findObjectConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    noDocument: false,
    responses: {}
  },

  /*****************************************************************************
   * saveObjectConfig
   *
   * These are the default values for the saveObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    returnsSavedObject  - The response will contain the saved object if true.
   *
   *    saveObjectSchema    - The schema used to validate the request body. If this is
   *                          undefined, the collection level schema (adapted for arrays)
   *                          will be used.
   *
   *    supportsUpsert      - If set to true, update will create objects in the collection if
   *                          they don't already exist.
   *
   * For a detailed description of the fields, view the saveObjectConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBSaveObjectConfig.html
   *
   */
  saveObjectConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    noDocument: false,
    responses: {},
    returnsSavedObject: true,
    saveObjectSchema: undefined,
    supportsUpsert: true
  },

  /*****************************************************************************
   * updateObjectConfig
   *
   * These are the default values for the updateObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    parameters              - An object of parameters which will be passed to handlers via the options argument.
   *                              Add more parameters by adding properties to this object. Default parameters:
   *
   *                              update  - The update document to be passed to the MongoDB driver.
   *
   *                              upsert  - A parameter to turn upsert on. If set to true, this will override
   *                                        supportsUpsert.
   *
   *    supportsUpsert        - If set to true, update will create objects in the collection if
   *                            they don't already exist.
   *
   *    updateObjectSchema    - The schema used to validate the request body. If this is
   *                            undefined, the collection level schema (adapted for arrays)
   *                            will be used.
   *
   * For a detailed description of the fields, view the updateObjectConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBUpdateObjectConfig.html
   *
   */
  updateObjectConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    example: undefined,
    noDocument: false,
    parameters: {
      update: {
        description: 'The update spec',
        location: 'body',
        required: true,
        schema: undefined
      },
      upsert: {
        description: 'Enable upsert',
        location: 'query',
        schema: {
          oneOf: [
            {type: 'boolean', default: false},
            {
              type: 'number',
              maximum: 1,
              minimum: 0,
              multipleOf: 1
            }
          ]
        },
        required: false,
        default: false
      }
    },
    responses: {},
    // returnsUpsertedObject: false, // This is not configurable on MongoDBCollection. It will always be false.
    supportsUpsert: false,
    updateObjectSchema: undefined
  },

  /*****************************************************************************
   * removeObjectConfig
   *
   * These are the default values for the removeObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   * For a detailed description of the fields, view the removeObjectConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBRemoveObjectConfig.html
   *
   */
  removeObjectConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    noDocument: false,
    responses: {},
    // returnsRemovedObject: false // This is not configurable on MongoDBCollection. It will always be false.
  },

  /*****************************************************************************
   * getCollection
   */
  getCollection: function() {
    return this.service.db.getCollection(this.collection)
  }


})

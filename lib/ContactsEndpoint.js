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
 *                            See the documentaion to learn about the structure of operation parameters:
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
    driverOptions: {}
    example: undefined,
    insertSchema: undefined,
    noDocument: false,
    responses: {},
    returnsInsertedObjects: true,
  },

  /*****************************************************************************
   * findConfig
   *
   * These are the default values for the findConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    idParamterDefinition    - The Operation Parameter definition for the id.The id parameter will
   *                              filter results by the id.
   *
   *    maxPageSize             - Maximum number of documents returned per page if pagination
   *                              is enabled.
   *
   *    pageSize                - Default number of documents returned per page if pagination
   *                              is enabled.
   *
   *    painationParameters     - Definitions for the page and pageSize parameters. The page parameter
   *                              is a whole number which requests a particular page. The default is 0.
   *                              The pageSize is a whole number which defines how many documents should
   *                              be returned per page. The default is 0 and it will not return more than
   *                              maxPageSize.
   *
   *    queryParameter          - The definition of the query parameter. By default this is the filter document
   *                              that will be sent to the MongoDB driver. It is expected in the querystring
   *                              as a variable named query.
   *
   *    supportsSkipAndLimit    - Skip and limit will be supported if set to true.
   *
   *    supportsPagination      - Pagination (with the page and pageSize parameters) will be supported if true.
   *
   *    supportsIdQuery         - Filtering by the id parameter will be supported if true.
   *
   *    skipAndLimitParameters  - Definitions for the skip and limit parameters.
   *
   * For a detailed description of the fields, view the findConfig docs here:
   * https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.mongodb.MongoDBFindConfig.html
   */
  findConfig: {
    allowUnauthenticated: false,
    description: undefined,
    driverOptions: {},
    idParameterDefinition: {
      description: STRINGS.idParameterDefinition.description,
      schema: {
        oneOf: [
          { type: 'string' },
          {
            type: 'array',
            items: { type: 'string' }
          }
        ]
      },
      location: 'query',
      required: false,
    },
    maxPageSize: undefined,
    noDocument: false,
    pageSize: 50,
    parameters: {
      page: {
        description: STRINGS.paginationParameters.page.description,
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
        description: STRINGS.paginationParameters.pageSize.description,
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      }
    },
    queryParameter: {
      query: {
        description: STRINGS.queryParameter.query.description,
        schema: { type: 'object' },
        location: 'query',
        required: false,
        default: {}
      }
    },
    responses: {},
    supportsSkipAndLimit: true,
    supportsPagination: false,
    supportsIdQuery: true,
    skipAndLimitParameters: {
      skip: {
        description: STRINGS.parameters.skip.description,
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      },
      limit: {
        description: STRINGS.parameters.limit.description,
        schema: {
          type: 'number',
          multipleOf: 1,
          minimum: 0
        },
        location: 'query',
        required: false
      }
    }
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
    driverOptions: {}
    example: undefined,
    noDocument: false,
    responses: {},
    returnsSavedObjects: true,
    saveSchema: undefined,
  },


  /****************************************************************************
   * updateConfig
   *
   * These are the default values for the updateConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    queryParameter          - The definition of the query parameter. By default this is the filter document
   *                              that will be sent to the MongoDB driver. It is expected in the querystring
   *                              as a variable named query.
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
   *    upsertParameter         - The definition of the upsert parameter. If set to true, this will override
   *                              supportsUpsert.
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
    queryParameter: {
      query: {
        description: STRINGS.queryParameter.query.description,
        schema: {type: 'object'},
        location: 'query',
        required: false,
        default: {}
      }
    },
    responses: {},
    returnsUpsertedObjects: false, // This is not configurable on MongoDBCollection. It will always be false.
    supportsQuery: true
    supportsUpsert: false,
    updateSchema: undefined,
    upsertParameter: {
      upsert: {
        description: STRINGS.upsertParameter.upsert.description,
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
    }
  },

  /*****************************************************************************
   * removeConfig
   *
   * These are the default values for the removeConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    queryParameter          - The definition of the query parameter. By default this is the filter document
   *                              that will be sent to the MongoDB driver. It is expected in the querystring
   *                              as a variable named query.
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
    queryParameter: {
      query: {
        description: STRINGS.queryParameter.query.description,
        schema: {type: 'object'},
        location: 'query',
        required: false,
        default: {}
      }
    },
    responses: {},
    returnsRemovedObjects: false, // This is not configurable on MongoDBCollection. It will always be false.
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
    driverOptions: {}
    example: undefined,
    insertObjectSchema: undefined,
    noDocument: false,
    responses: {},
    returnsInsertedObject: true,
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
    responses: {},
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
    driverOptions: {}
    example: undefined,
    noDocument: false,
    responses: {},
    returnsSavedObject: true,
    saveObjectSchema: undefined,
    supportsUpsert: true,
  },

  /*****************************************************************************
   * updateObjectConfig
   *
   * These are the default values for the updateObjectConfig object. There are also several
   * read-only fields that should not be overwritten ("parameters", "idParameter", "endpoint").
   *
   *    supportsUpsert        - If set to true, update will create objects in the collection if
   *                            they don't already exist.
   *
   *    updateObjectSchema    - The schema used to validate the request body. If this is
   *                            undefined, the collection level schema (adapted for arrays)
   *                            will be used.
   *
   *    upsertParameter       - The definition of the upsert parameter. If set to true, this will override
   *                            supportsUpsert.
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
    responses: {},
    returnsUpsertedObject: false, // This is not configurable on MongoDBCollection. It will always be false.
    supportsUpsert: false,
    updateObjectSchema: undefined,
    upsertParameter: {
      upsert: {
        description: STRINGS.upsertParameter.upsert.description,
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
    }
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
    driverOptions: {}
    noDocument: false,
    responses: {},
    returnsRemovedObject: false, // This is not configurable on MongoDBCollection. It will always be false.
  },

  /*****************************************************************************
   * getCollection
   */
  getCollection: function() {
    return this.service.db.getCollection(this.collection)
  }


})

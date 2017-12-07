var assert = require('assert')
var carbon = require('carbon-io')
var o      = carbon.atom.o(module)
var _o     = carbon.bond._o(module)
var __     = carbon.fibers.__(module)


/***************************************************************************************************
 * Test
 */
__(function() {
  module.exports = o.main({

    /***************************************************************************
     * _type
     */
    _type: carbon.carbond.test.ServiceTest,

    /***************************************************************************
     * name
     */
    name: "ContactServiceTests",

    /***************************************************************************
     * service
     */
    service: _o('../lib/ContactService.js'),

    /***************************************************************************
     * setup
     */
    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },

    /***************************************************************************
     * teardown
     */
    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
    },

    /***************************************************************************
     * suppressServiceLogging
     */
    suppressServiceLogging: true,

    /***************************************************************************
     * tests
     */
    tests: [

      /*************************************************************************
       * POST /contacts
       *
       * Test adding a new contact.
       */
      {
        name: "POST /contacts (array)",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "POST",
            body: [
              {
                firstName: "Mary",
                lastName: "Smith",
                email: "mary@smith.com",
                phoneMobile: "415-555-5555"
              },
              {
                firstName: "Bob",
                lastName: "Jones",
                email: "bob@jones.com",
                phoneMobile: "415-555-5555"
              }
            ]
          }
        },
        resSpec: {
          statusCode: 201
        }
      },

      /*************************************************************************
       * GET /contacts?query=mary@smith.com
       *
       * Test finding the previously added contact by email.
       */
      {
        name: "GET /contacts?query={email:mary@smith.com}",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "GET",
            parameters: {
              query: {
                email: "mary@smith.com"
              }
            }
          }
        },
        resSpec: {
          statusCode: 200,
        }
      },
      
      /*************************************************************************
       * PUT /contacts
       *
       * Test saving contacts (overwrites entire collection)
       */
      {
        name: "PUT /contacts",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "PUT",
            body: [
              {
                _id: '1',
                firstName: "Mary",
                lastName: "Smith",
                email: "mary@smith.com",
                phoneMobile: "415-555-5555"
              },
              {
                _id: '2',
                firstName: "Bob",
                lastName: "Jones",
                email: "bob@jones.com",
                phoneMobile: "415-555-5555"
              }
            ]
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      /*************************************************************************
       * PATCH /contacts
       *
       * Test updating every document in the collection using PATCH.
       */
      {
        name: "PATCH /contacts",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "PATCH",
            body: {
              $set: {
                firstName: "Spartacus"
              }
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      /*************************************************************************
       * DELETE /contacts
       *
       * Test deleting the entire collection.
       */
      {
        name: "DELETE /contacts",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "DELETE"
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      /*************************************************************************
       * POST /contacts
       *
       * Test adding a new contact (just a single object). This uses insertObject.
       */
      {
        name: "POST /contacts (object)",
        reqSpec: function(context) {
          return {
            url: `/contacts`,
            method: "POST",
            body: {
              firstName: "Mary",
              lastName: "Smith",
              email: "mary@smith.com",
              phoneMobile: "415-555-5555"
            }
          }
        },
        resSpec: {
          statusCode: 201
        }
      },

      /*************************************************************************
       * GET /contacts/:_id
       *
       * Test finding the previously added contact by _id.
       */
      {
        name: "GET /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes('POST /contacts (object)').headers.location,
            method: "GET"
          }
        },
        resSpec: function(response, context) {
          var previousResponse = context.httpHistory.getRes(-1)
          assert.deepEqual(response.body, previousResponse.body)
        }
      },

      /*************************************************************************
       * PUT /contacts/:_id
       *
       * Test saving changes to the contact via PUT. Here we are saving back the
       * entire object.
       */
      {
        name: "PUT /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes('POST /contacts (object)').headers.location,
            method: "PUT",
            body: {
              _id: context.httpHistory.getRes('GET /contacts/:_id').body._id,
              firstName: "Mary",
              lastName: "Smith",
              email: "mary.smith@gmail.com", // We are changing email
              phoneMobile: "415-555-5555"
            }
          }
        },
        resSpec: {
          statusCode: 200
        }
      },
      
      /*************************************************************************
       * PATCH /contacts/:_id
       *
       * Test saving changes to the contact via PATCH.
       */
      {
        name: "PATCH /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes('POST /contacts (object)').headers.location,
            method: "PATCH",
            body: {
              phoneMobile: "555-867-5309"
            }
          }
        },
        resSpec: {
          statusCode: 200,
          body: {
            n: 1
          }
        }
      },

      /*************************************************************************
       * DELETE /contacts/:_id
       *
       * Test removing the contact.
       */
      {
        name: "DELETE /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes('POST /contacts (object)').headers.location,
            method: "DELETE"
          }
        },
        resSpec: {
          statusCode: 200
        }
      },

      /*************************************************************************
       * DELETE /contacts/:_id
       *
       * Test that the contact is gone.
       */
      {
        name: "DELETE /contacts/:_id",
        reqSpec: function(context) {
          return {
            url: context.httpHistory.getRes('POST /contacts (object)').headers.location,
            method: "DELETE"
          }
        },
        resSpec: {
          statusCode: 404 // We should get 404 since this contact is already removed.
        }
      },
    ]
  })
})

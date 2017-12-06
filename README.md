# MongoDBCollection Configs

[![Build Status](https://img.shields.io/travis/carbon-io-examples/mongodb-collection-config/master.svg?style=flat-square)](https://travis-ci.org/carbon-io-examples/mongodb-collection-config) ![Carbon Version](https://img.shields.io/badge/carbon--io-0.7-blue.svg?style=flat-square)


This example illustrates how to configure operation handlers in `MongoDBCollection`. Collections have 10 operation handlers which correspond to the following HTTP Methods:

|  Operation Handler  |    HTTP Method and Endpoint    |
|---------------------|--------------------------------|
| `insert`            | `POST /<collection>`           |
| `find`              | `GET /<collection>`            |
| `save`              | `PUT /<collection>`            |
| `update`            | `PATCH /<collection>`          |
| `remove`            | `DELETE /<collection>`         |
| `insertObject`      | `POST /<collection>/<_id>`     |
| `findObject`        | `GET /<collection>/<_id>`      |
| `saveObject`        | `PUT /<collection>/<_id>`      |
| `updateObject`      | `PATCH /<collection>/<_id>`    |
| `removeObject`      | `DELETE /<collection>/<_id>`   |

Each handler has a config object such as `insertConfig` or `removeObjectConfig`. These contain common configuration options for handlers such as:

- documentation for the handlers,
- schema for validating requests,
- parameter definitions,
- and behavioral flags such as `returnsInsertedObjects`.

**You can view a `MongoDBCollection` with all of the default config objects in [`lib/ContactsEndpoint.js`](lib/ContactsEndpoint.js). That file contains detailed comments on all of the configuration options. You can also read more in the [documentation](https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.collections.CollectionOperationConfig.html).**

Here are a few useful notes on a some of the config options:

- **parameters**: This is an object of parameters which will be passed to handlers via the options argument. See the [OperationParameter documentation](https://docs.carbon.io/en/master/packages/carbond/docs/ref/carbond.OperationParameter.html) to learn about the structure of operation parameters. You can overwrite the default parameters or add more by using the `$merge` keyword of Atom. For example:

    ```js
    parameters: {
      $merge: {
        datetime: {
          location: 'query',
          schema: {
            type: 'string'
          },
          required: false
        }
      }
    }
    ```

- **returnsUpsertedObjects** and **returnsRemovedObjects**: The `insert`, `save`, `insertObject`, and `saveObject` handlers can be configured to respond with the inserted or saved documents by setting `returnsInsertedObjects` or `returnsSavedObjects` to `true`. However, due to limitations with MongoDB, `returnsUpsertedObjects` and `returnsRemovedObjects` cannot be set to `true`. You cannot receive the upserted or removed objects from the response without a second database call. If you require this, you should implement it in a [post hook](https://docs.carbon.io/en/master/packages/carbond/docs/guide/collections/collection-operation-hooks.html).

## Installing the service

We encourage you to clone the git repository so you can play around
with the code.

```
$ git clone git@github.com:carbon-io-examples/mongodb-collection-config.git
$ cd mongodb-collection-config
$ npm install
```

## Setting up your environment

This example expects a running MongoDB database. The code will honor a `DB_URI` environment variable. The default URI is
`mongodb://localhost:27017/contacts`.

To set the environment variable to point the app at a database different from the default (on Mac):
```
$ export DB_URI=mongodb://localhost:27017/mydb
```

## Running the service

To run the service:

```sh
$ node lib/ContactService
```

For cmdline help:

```sh
$ node lib/ContactService -h
```

## Accessing the service

You can interact with the service via HTTP. Here is an example using curl to create a new user:

```
$ curl localhost:9900/users -H "Content-Type: application/json" -d '{"email":"foo@bar.com", "password":"foobar"}'
```

## Running the unit tests

This example comes with a simple unit test written in Carbon.io's test framework called TestTube. It is located in the `test` directory.

```
$ node test/ContactServiceTest
```

or

```
$ npm test
```

## Generating API documentation (aglio flavor)

To generate documentation using aglio, install it as a devDependency:

```
$ npm install -D --no-optional aglio
```

Using `--no-optional` speeds up aglio's install time significantly. Then generate the docs using this command:

```sh
$ node lib/ContactService gen-static-docs --flavor aglio --out docs/index.html
```

* [View current documentation](
http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io-examples/mongodb-collection-config/blob/carbon-0.7/docs/index.html)

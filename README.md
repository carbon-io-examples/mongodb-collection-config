# Contact Service

This example illustrates the use of Carbon.io to implement a public API for managing contacts using Collection endpoints. This 
API also handles user management, and allows for new users to register via the API, and then use the API to manage their 
contacts separate from other users' contacts. 

## Installing the service

We encourage you to clone the git repository so you can play around
with the code. 

```
% git clone git@github.com:carbon-io/example__contact-service.git
% cd example__contact-service
% npm install
```

## Running the service

To run the service:

```sh
% node lib/ContactService
```

For cmdline help:

```sh
% node lib/ContactService -h
```

## Accessing the service

You can interact with the service via HTTP. Here is an example using curl to create a new user:

```
% curl localhost:9900/users -H "Content-Type: application/json" -d '{"email":"foo@bar.com", "password":"foobar"}'
```

## Running the unit tests

This example comes with a simple unit test written in Carbon.io's test framework called TestTube. It is located in the ```test``` directory. 

```
% node test/ContactServiceTest
```

or 

```
% npm test
```

## Generating API documentation (aglio flavor)

```sh
% node lib/ContactService gen-static-docs --flavor aglio --out docs/index.html
```

* [View current documentation](
http://htmlpreview.github.io/?https://raw.githubusercontent.com/carbon-io/example__contact-service/master/docs/index.html)

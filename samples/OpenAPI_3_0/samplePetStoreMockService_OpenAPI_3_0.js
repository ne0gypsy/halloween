//Sample mock service for OpenAPI 3.0 PetStore API

const util = require('util')

const Validator = require('swagger-model-validator');
const Swagger = require('swagger-client');

var express = require('express');
var bodyParser = require('body-parser');

const fs = require('fs');
const yaml = require('js-yaml');
var path = require('path');

var url = path.join(__dirname, "./samplePetStoreSwagger_OpenAPI_3_0.yaml");
var spec = yaml.safeLoad(fs.readFileSync(url), 'utf-8');

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

var crypto = require('crypto');

var generate_key = function() {
    return crypto.randomBytes(16).toString('base64');
};

var app = express();

app.use(bodyParser.json());
app.listen(1234, () => {
 console.log('Server running on port 1234');
});

app.post('/pets', (req, res, next) => {
    Swagger({ spec: spec })
    .then( client => {
        validator = new Validator(client.spec);
        var validation = client.spec.validateModel('Pet', req.body);
        if (validation.valid == true) {
            const session_token = generate_key();
            success = myCache.set( req.body.id, session_token, 300 );
            var mockResponse = {

            };
            res.statusCode = 201;
            res.set('session-token', session_token);
            res.json();
        }
        else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.send(util.inspect(validation, false));
        }
    })

});

app.get('/pets/:petId', (req, res, next) => {
    Swagger({ spec: spec })
    .then( client => {
        const key_value = myCache.get( req.params.petId );
        if (req.headers['session-token'] == key_value) {
            changed = myCache.ttl( req.params.petId, 300 )
            var mockResponse = {
                "id": "123",
                "name": "Pet1",
                "tag": "Small"
            };
            validator = new Validator(client.spec);
            var validation = client.spec.validateModel('Pet', mockResponse);
            if (validation.valid == true) {
                res.statusCode = 201;
                res.set('session-token', req.headers['session-token']);
                res.json(mockResponse);
            }
            else {
                console.log(til.inspect(validation, false));
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.send(util.inspect(validation, false));
            }
        }
        else {
            res.statusCode = 401;
            res.json('Unauthorised');
        }
    });
});
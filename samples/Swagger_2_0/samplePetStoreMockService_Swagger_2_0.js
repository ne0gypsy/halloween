//Sample mock service for Swagger 2.0 PetStore API

var express = require('express');
var bodyParser = require('body-parser');

var swaggerValidator = require('swagger-object-validator');
var validator = new swaggerValidator.Handler('./samplePetStoreSwagger_Swagger_2_0.yaml');

var apiPath = './samplePetStoreSwagger_Swagger_2_0.yaml';
var Swagmock = require('swagmock');
var mockgen = Swagmock(apiPath);

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
    validator.validateModel(req.body, 'Pet', function (err, result) {
        if (result.humanReadable() == 'Valid') {
            const session_token = generate_key()
            success = myCache.set( req.body.id, session_token, 300 );
            mockgen.responses({
                path: '/pets',
                operation: 'post',
                response: 201
            }, (error, mock) => {
                res.statusCode = 201;
                res.set('session-token', session_token);
                res.json(mock.responses);
                });
        }
        else {
            res.statusCode = 400;
            res.json(result);
        }
    });
});

app.get('/pets/:petId', (req, res, next) => {
            const key_value = myCache.get( req.params.petId );
            if (req.headers['session-token'] == key_value)
                {
                    changed = myCache.ttl( req.params.petId, 300 )
                    mockgen.responses({
                        path: '/pets/{petId}',
                        operation: 'get',
                        response: 200
                    }, (error, mock) => {
                        res.statusCode = 200;
                        res.set('session-token', req.headers['session-token']);
                        res.json(mock.responses);
                        });
                }

            else {
                res.statusCode = 401;
                res.json('Unauthorised');
            }
});
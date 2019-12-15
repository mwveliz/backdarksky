# backend for calling darksky

> POC: Nodejs - Express REST API with redis 

This POC has one endpoint that is called from the frontend react project
located at https://github.com/mwveliz/frontdarksky

## Usage

to start the project

```
    npm start
```

## API
The two of them are  GET
```
http://localhost:5000/darksky/72.31/-53.06
http://localhost:5000/darksky/-66.56/10.3

```


## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm i
```

## Docker Deploy

```
$ docker build -t backdarksky .

$ docker run -d -v deploy -p 0.0.0.0:5000:5000 -p 0.0.0.0:6379:6379 --name backdarksky backdarksky

```

## Acknowledgments

mwveliz@gmail.com

## See Also

Frontend repo: https://github.com/mwveliz/frontdarksky
docker-compose for deployment: https://github.com/mwveliz/traefikdarksky
## License

GPL V-3.0


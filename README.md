# A Node.JS Forward Proxy Server
An HTTP proxy tunnel for both HTTP and HTTPS traffic.

### Packages used:
* ```http```
* ```url```
* ```net```

### Installation and Usage
#### Clone the repository:  
    $ git clone https://github.com/gl14916/nodejs-forward-proxy-server.git  
    $ cd nodejs-forward-proxy-server
#### Install package dependencies:
    $ npm install

#### Start forward proxy server using the following command:
```$ npm start``` or ```$ node proxy.js```  

### Specification
By default, this proxy server listens on port ```2560```, it can be changed by modifying the last line of code (```proxy.js:75```)  

If you wish to use a port number under ```1024```, you need to run this proxy server as root:  
```$ sudo npm start``` or ```$ sudo node proxy.js```

### License
MIT
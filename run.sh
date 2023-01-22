forever stop main.js
NODE_ENV=production forever start -l forever.log -o out.log -e err.log -a main.js
const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
var glob = require( 'glob' );

const fs = require('fs');
const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');
const JENKINS_IP = "192.168.33.20";


exports.command = 'useful-tests';
exports.desc = 'Initiate analysis of test suite for iTrust';
exports.builder = yargs => {
    yargs.options({
        count: {
          description: 'to run `-c` numbers of times',
          alias: 'c',
          type: 'number',
        }
    });
};

exports.handler = async argv => {
    const { count } = argv;

    (async () => {

        await run( count );

    })();

};

async function run(count) {

  fs.writeFile(__dirname + '/../testsuite/count', '', (err) => { if (err) throw err; });

  fs.writeFile(__dirname + '/../testsuite/count', count.toString(), (err) => { if (err) throw err; });

  let filePath = '/bakerx/testsuite/playbook.yml';
  let inventoryPath = '/bakerx/pipeline/inventory.ini';

  result = sshSync(`sudo /usr/bin/node /bakerx/testsuite/driver.js --no-warnings`, `vagrant@${JENKINS_IP}`,'ignore');
  if( result.error ) { process.exit( result.status ); }

  // console.log(chalk.blueBright('Running ansible script...'));
  // result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath}`, `vagrant@${JENKINS_IP}`);
  // if( result.error ) { process.exit( result.status ); }


}

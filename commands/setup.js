const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');
const JENKINS_IP = "192.168.33.20";

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    const { privateKey } = argv;

    (async () => {

        await run( privateKey );

    })();

};

async function run(privateKey) {

    console.log(chalk.greenBright('Installing jenkins server!'));

    console.log(chalk.blueBright('Provisioning configuration server...'));
    let result = child.spawnSync(`bakerx`, `run jenkins-srv bionic --ip ${JENKINS_IP} --sync`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Installing privateKey on jenkins server'));
    let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    result = scpSync (identifyFile, `vagrant@${JENKINS_IP}:/home/vagrant/.ssh/mm_rsa`);
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Running init script...'));
    result = sshSync('/bakerx/pipeline/server-init.sh', `vagrant@${JENKINS_IP}`);
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    let filePath = '/bakerx/pipeline/playbook.yml';
    let inventoryPath = '/bakerx/pipeline/inventory.ini';

    console.log(chalk.blueBright('Running ansible script...'));
    result = sshSync(`/bakerx/pipeline/run-ansible.sh ${filePath} ${inventoryPath}`, `vagrant@${JENKINS_IP}`);
    if( result.error ) { process.exit( result.status ); }

}

const {ipcRenderer} = require('electron')
const fs            = require('fs-extra')
const os            = require('os')
const path          = require('path')

const ConfigManager = require('./configmanager')
const DistroManager = require('./distromanager')
const LangLoader    = require('./langloader')
const logger        = require('./loggerutil')('%c[Préchargeur]', 'color: #a02d2a; font-weight: bold')

logger.log('Chargement..')

// Load ConfigManager
ConfigManager.load()

// Load Strings
LangLoader.loadLanguage('fr_Fr')

function onDistroLoad(data){
    if(data != null){
        
        // Resolve the selected server if its value has yet to be set.
        if(ConfigManager.getSelectedServer() == null || data.getServer(ConfigManager.getSelectedServer()) == null){
            logger.log('Détermination du serveur sélectionné par défaut.')
            ConfigManager.setSelectedServer(data.getMainServer().getID())
            ConfigManager.save()
        }
    }
    ipcRenderer.send('distributionIndexDone', data != null)
}

// Ensure Distribution is downloaded and cached.
DistroManager.pullRemote().then((data) => {
    logger.log('Index de distribution chargé.')

    onDistroLoad(data)

}).catch((err) => {
    logger.log('Impossible de charger l\'index de distribution.')
    logger.error(err)

    logger.log('Tentative de chargement d\'une ancienne version de l\'index de distribution.')
    // Try getting a local copy, better than nothing.
    DistroManager.pullLocal().then((data) => {
        logger.log('Une ancienne version de l\'index de distribution a été chargée avec succès.')

        onDistroLoad(data)


    }).catch((err) => {

        logger.log('Échec du chargement d\'une ancienne version de l\'index de distribution.')
        logger.log('L\'application ne peut pas s\'exécuter.')
        logger.error(err)

        onDistroLoad(null)

    })

})

// Clean up temp dir incase previous launches ended unexpectedly. 
fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if(err){
        logger.warn('Erreur lors du nettoyage du répertoire natif', err)
    } else {
        logger.log('Répertoire natif nettoyé.')
    }
})
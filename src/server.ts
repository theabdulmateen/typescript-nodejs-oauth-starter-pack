import errorHandler from 'errorhandler'

// import genKeyPair from './utils/generateKeyPair'
import app from './app'

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === 'development') {
	console.log('Performing development specifics...')
	app.use(errorHandler())
	// genKeyPair()
}

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
	console.log(
		'  App is running at http://localhost:%d in %s mode',
		app.get('port'),
		app.get('env')
	)
	console.log('  Press CTRL-C to stop\n')
})

export default server

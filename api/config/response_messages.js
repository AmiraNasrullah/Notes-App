module.exports = {
	errors: {
		user: {
			'requiredUsername': 'You must enter a username.',
			'requiredPassword': 'You must enter a password.',
			'usernameTaken': 'That username is already in use.',
			'notFound': 'User not found.'
		},
		note: {
			'requiredText': 'You must enter a text.',
			'notFound': 'Note not found.',
			'accessNotFound': 'You don\'t have access to this note'		
		}
	},
	success: {
		user:{
			'create': 'User created Successfully.',
			'update': 'User updated Successfully.',
			'delete': 'User deleted Successfully.'
		},
		note:{
			'create': 'Note created Successfully.',
			'update': 'Note updated Successfully.',
			'delete': 'Note deleted Successfully.',
			'share': 'Note shared Successfully.',
			'unshare': 'Note unShared Successfully.'
		}		
	}
}

module.exports={
    upload: {
        config: {
            provider: 'cloudinary',
            providerOptions: {
            cloud_name: process.env.CLOUDINARY_NAME, // Nombre de tu cuenta en Cloudinary
            api_key: process.env.CLOUDINARY_KEY,     // Clave API de Cloudinary
            api_secret: process.env.CLOUDINARY_SECRET, // API Secret de Cloudinary
            },
            actionOptions: {
            upload: {},
            delete: {},
            },
        },
    },
    'invenwork':{
        enabled: true,
        resolve: './src/plugins/invenwork'
    },
}
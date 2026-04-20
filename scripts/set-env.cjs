const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const targetPath = './src/environments/environment.ts';

const envConfigFile = `export const environment = {
	production: true,
	supabaseUrl: '${process.env.SUPABASE_URL || ''}',
	supabaseKey: '${process.env.SUPABASE_KEY || ''}'
};
`;

const envDirectory = './src/environments';
if (!fs.existsSync(envDirectory)) {
	fs.mkdirSync(envDirectory, { recursive: true });
}

fs.writeFile(targetPath, envConfigFile, function (err) {
	if (err) {
		console.error('Erro ao gerar o arquivo de environment:', err);
		throw err;
	}
	console.log(`Variáveis de ambiente injetadas com sucesso em ${targetPath}`);
});

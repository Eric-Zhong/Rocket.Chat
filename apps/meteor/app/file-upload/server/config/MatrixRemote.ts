import { FederationMatrix } from '@rocket.chat/core-services';
import { FileUploadClass } from '../lib/FileUpload';

const MatrixRemoteHandler = new FileUploadClass({
	name: 'MatrixRemote',

	async get(file, req, res) {
		await FederationMatrix.downloadRemoteFile(file, req, res);
	},
});

export { MatrixRemoteHandler };

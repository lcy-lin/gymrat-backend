import pkg from 'aws-sdk';
const { S3 } = pkg;
import fs from 'fs';

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

export default function uploadFile(file) {
    try {
        if (file && file.path) {
            const fileStream = fs.createReadStream(file.path);
            const uploadParams = {
                Bucket: bucketName,
                Body: fileStream,
                Key: file.filename,
            };
            return s3.upload(uploadParams).promise();
        } else {
            console.error('File path is undefined.');
            return Promise.reject(new Error('File path is undefined.'));
        }
    } catch (error) {
        console.error('Error in uploadFile:', error);
        return Promise.reject(error);
    }
}


export function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.getObject(downloadParams).createReadStream();
}       
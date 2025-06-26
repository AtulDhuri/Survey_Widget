pipeline { 
    agent any

    environment {
        BUCKET = 'atultest6-26-2025' // ✅ Replace with actual S3 bucket name
    }

    stages {
        stage('Clone Repo') {
            steps {
                git 'https://github.com/AtulDhuri/Survey_Widget.git'
            }
        }

        stage('Upload to S3') {
            steps {
                echo 'Uploading file to S3...'
                sh '''
                aws s3 cp index.html s3://$BUCKET/index(4).html --acl public-read
                '''
            }
        }
    }
}

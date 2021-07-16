# MOOST Module for OpenHAB Cloud

d23ee2a7-a467-41a6-9d84-4163828d8bbc 0TStYEw6KfagJ9uGvsxM

## How to configure OpenHAB Cloud

Below you find the needed steps to configure OpenHAB Cloud to be able to communicate to the local OpenHAB instance. The settings
for the communication to the MOOST Recommender Platform (username / password) are found within ```modules/moost/config.json```.

### Find USER ID

First we need to get the user ID of the user for which we will configure the MOOST Recommender Platform. We can get this via the
following flow.

- Connect to the mongodb:  
  ```docker exec -it openhab-cloud_mongodb_1 bash```
- Fire up the MongoDB CLI:  
  ```mongo```
- Target the openhab Database:  
  ```use openhab```
- Read the USER ID Field from the user you want to setup MOOST Recommender Platform for:  
  ```db.users.find().pretty()```

### Create the new Entities

The needed entities in the Database can be created via a simple node script. The script lifes in ```/opt/openhabcloud/scripts```
within the openhab-cloud container.

- First connect to the container:  
  ```docker exec -it openhab-cloud_app_1 bash```
- Navigate into the script folder:  
  ```cd /opt/openhabcloud/scripts```
- Now call the ```addoauth.js``` script with the following pattern
    - ```node addoauth.js <clientName> <clientId> <clientSecret> <clientToken> <clientUserId>```
    -
    f.e. ```node addoauth.js moostClient ae43aab9b808409a8c962dc4e8ad3041 94b75727c9ff49239f913eac67f142ff xw4tHQPORJddQbelJfka4uhZqN7rKZoE 60358a6c5897f3f2cc788396```

**addoauth.js Parameter description**

- clientName: Defaults to ```moostClient```
- clientId: A unique identifier for this client (generate a new one online)
- clientSecret: // Client oauth2 secret (generate a new one online)
- clientToken: The Bearer token which is used to authenticate to the local OpenHAB. Has to be generated in the openhab ui under
  profile! Including the oh.name. part
- clientUserId: The User ID we have read from mongodb in the last step

### User devices for local development

The Openhab APP is only able to connect to openhab cloud instances via https. As we do not have a valid SSL certificate for the
local development environment we need to mock the device in the database of the local openhab cloud instace.

For this connect to the local OpenHAB-Cloud instance:
```docker exec -it openhab-cloud_mongodb_1 bash```

Start the MongoDB CLI:
```mongo```

Set the active database to the openhabcloud DB:
```use openhab```

//Userdevices for local development {"owner" : ObjectId("5fca060e5560160414351a17"),"deviceType" : "android","deviceId" : "
420c5187f11d0f35","androidRegistration" : "fLbGYug1TJ2YHwDJO6ZVsx:
APA91bEII56UjMZal6HyLURJNfngRrcsSnsnHh_lJU4HC9CAWWo1BeywCiXMztya7tNttWL1J_toh8ISMCTLz74zBqaKu8S-4f5Tu2JpyZc7jEKQWiiKmQ-XBr9TIaCW2JtxzIgNFwXI"
,"deviceModel" : "Samsung SM-G973F","lastUpdate" : ISODate("2020-12-19T13:25:52.002Z"),"registered" : ISODate("2020-12-19T13:25:
51.874Z")}

//Encrypt Tester Password

mvn jasypt:encrypt -Djasypt.encryptor.password=U9dK06mHkJKsHpPIX -Djasypt.plugin.path="file:
src/main/resources/application-default.properties"

### Comands File

# console consumer kafka

/opt/kafka/bin/kafka-console-consumer.sh \
--bootstrap-server 10.150.0.50:9092 \
--topic recommendations \
--consumer.config /opt/kafka/config/consumer.properties \
--from-beginning

/opt/kafka/bin/kafka-console-consumer.sh \
--bootstrap-server 10.150.0.50:9092 \
--topic events \
--consumer.config /opt/kafka/config/consumer.properties \
--from-beginning

# ms-ff-rest

mvn -B clean package --file pom.xml -DskipTests ./mvnw appengine:deploy -Dmaven.main.skip -DskipTests
-Dapp.deploy.deployables=app.yaml gcloud app logs tail -s ms-ff-rest

# run flink job

~/Downloads/flink-1.11.3/bin/flink run -c io.moost.flink.MoostMusicRuleExectuorJob target/fk-rules-execution-1.0-SNAPSHOT.jar

1611579430 1612443377

{
"_id" : ObjectId("60351d109de20f71d59438e1"),
"active" : true,
"verifiedEmail" : false,
"created" : ISODate("2021-02-23T15:19:44.631Z"),
"registered" : ISODate("2021-02-23T15:19:44.631Z"),
"last_online" : ISODate("2021-02-23T15:19:44.631Z"),
"username" : "lucas.senn@moost.io",
"salt" : "$2a$10$KRx3Pf9tLfePHb/9Mu0T6e",
"hash" : "$2a$10$KRx3Pf9tLfePHb/9Mu0T6eVG6SDSCJGhFXxpJBe0Vw9kmcB/iftCu",
"role" : "master",
"account" : ObjectId("60351d109de20f79ed9438e0"),
"__v" : 0 }

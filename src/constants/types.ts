const TYPES = {
  Database: Symbol.for('Database'),
  Application: Symbol.for('Application'),
  Logger: Symbol.for('Logger'),
  Server: Symbol.for('Server'),
  MailerDev: Symbol.for('MailerDev'),
  MailerAWS: Symbol.for('MailerAWS'),
  MailerFactory: Symbol.for('Factory<Mailer>'),
  InternalApisFactory: Symbol.for('Factory<InternalApis>'),
  InternalApisDev: Symbol.for('InternalApisDev'),
  InternalApisProd: Symbol.for('InternalApisProd'),
  FileStorageFactory: Symbol.for('Factory<FileStorage>'),
  FileStorageDev: Symbol.for('FileStorageDev'),
  FileStorageAWS: Symbol.for('FileStorageAWS'),
  Environment: Symbol.for('Environment'),
  AuthDev: Symbol.for('AuthDev'),
  AuthProd: Symbol.for('AuthProd'),
  AuthFactory: Symbol.for('Factory<Auth>'),
};

export default TYPES;

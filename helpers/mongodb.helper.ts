import { MongoClient } from "mongodb";

export default class MongoDBHelper {
  public db: any;
  private cnn: any;
  private port: number;
  private dbUri: string;

  private static _instance: MongoDBHelper;

  constructor(SETTINGS: any) {
    this.port = SETTINGS.PORT;
    this.dbUri = `mongodb://${SETTINGS.USER_NAME}:${SETTINGS.USER_PASSWORD}@${SETTINGS.HOST}/${SETTINGS.DEFAULT_DATABASE}`;
  }

  // Patron Singleton
  public static getInstance(settings: any) {
    return this._instance || (this._instance = new this(settings));
  }

  async connect() {
    try {
      const connection = await MongoClient.connect(this.dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.cnn = connection;
      this.db = this.cnn.db();
      console.log(`MongoDB running on port: ${this.port}`);
    } catch (error) {
      console.log(`Ocurrio un error al intentar conectarse a MongoDB:`, error);
    }
  }

  setDataBase(dbName: string) {
    this.db = this.cnn.db(dbName);
  }

  async close() {
    try {
      await this.cnn.close();
    } catch (error) {
      console.log(error);
    }
  }
}

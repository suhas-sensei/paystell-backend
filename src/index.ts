import "reflect-metadata";
import app from './app';
import AppDataSource from './config/db';

async function main () {

  try {
    await AppDataSource.initialize();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {


try {
    // await AppDataSource.initialize();
    app.listen(3000);
    console.log('Sever is listening on port', 3000);
} catch (error) {

    console.log(error);
  }
}

main();

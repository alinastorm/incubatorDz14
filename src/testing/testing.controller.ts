import { Controller, Get, Delete, HttpCode } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import mongoose from 'mongoose';

@Controller('testing')
export class TestingController {
    constructor(@InjectConnection() private readonly connection: Connection) { }

    @Delete("/all-data") @HttpCode(204)
    async deleteAllData() {
        try {
            await this.connection.db.dropDatabase();
            // await this.connection.db.dropCollection('users');
            return 
        } catch (error) {
            console.log(error);
        }
    }
}
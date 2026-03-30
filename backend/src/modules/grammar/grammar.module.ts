import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrammarRule } from './domain/grammar-rule.entity';
import { GrammarService } from './application/grammar.service';
import { GrammarRepository } from './application/grammar.repository';
import { GrammarController } from './presentation/grammar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GrammarRule])],
  controllers: [GrammarController],
  providers: [GrammarService, GrammarRepository],
  exports: [GrammarService],
})
export class GrammarModule {}

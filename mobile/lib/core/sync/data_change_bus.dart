import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'data_changed.dart';

part 'data_change_bus.g.dart';

@Riverpod(keepAlive: true)
class DataChangeBus extends _$DataChangeBus {
  @override
  DataChanged? build() => null;

  void emit(Set<String> tags) {
    state = DataChanged(tags: tags);
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data_changed.dart';
import 'data_change_bus.dart';

mixin DataChangeBusSubscriber<T> on AsyncNotifier<T> {
  void watchTags(Set<String> tags) {
    ref.listen<DataChanged?>(dataChangeBusProvider, (previous, next) {
      if (next != null && next.tags.intersection(tags).isNotEmpty) {
        ref.invalidateSelf();
      }
    });
  }
}

extension RefTagSubscription on Ref {
  void watchDataChangeTags(Set<String> tags, void Function() onMatch) {
    listen<DataChanged?>(dataChangeBusProvider, (previous, next) {
      if (next != null && next.tags.intersection(tags).isNotEmpty) {
        onMatch();
      }
    });
  }
}

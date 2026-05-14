import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data_changed.dart';
import 'data_change_bus.dart';

mixin DataChangeBusSubscriber<T> on AsyncNotifier<T> {
  DataChanged? _lastHandled;

  void watchTags(Set<String> tags) {
    ref.listen<DataChanged?>(dataChangeBusProvider, (previous, next) {
      if (next != null &&
          next.tags.intersection(tags).isNotEmpty &&
          !identical(next, _lastHandled)) {
        _lastHandled = next;
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

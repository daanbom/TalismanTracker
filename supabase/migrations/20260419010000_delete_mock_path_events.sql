delete from game_expansion_events
where event_type = 'path_completed'
  and detail in (
    'Way of Light',
    'Path of Destiny',
    'Sylvan Path',
    'Ancient Way',
    'Dark Path'
  );

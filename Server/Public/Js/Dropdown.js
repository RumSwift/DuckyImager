document.querySelectorAll('.hdrop').forEach(function(Drop) {
    Drop.querySelector('.hdrop-closed').addEventListener('click', function(Event) {
        Event.stopPropagation();
        const IsOpen = Drop.classList.contains('open');
        document.querySelectorAll('.hdrop').forEach(function(D) { D.classList.remove('open'); });
        if (!IsOpen) Drop.classList.add('open');
    });

    Drop.querySelectorAll('.hdrop-option').forEach(function(Option) {
        Option.addEventListener('click', function(Event) {
            Event.stopPropagation();
            Drop.querySelector('.hdrop-text').textContent = Option.textContent;
            Drop.classList.remove('open');

            const Part = Option.getAttribute('data-part');
            if (Part && typeof SetPart === 'function') {
                SetPart(Part);
            }
        });
    });
});

document.addEventListener('click', function() {
    document.querySelectorAll('.hdrop').forEach(function(D) { D.classList.remove('open'); });
});
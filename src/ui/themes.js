    const themes = [{
        name: 'Default / Reload',
        gradient: '',
        textColor: '',
        raised: '',
        btnTranslate: '',
        CurrentProgressVideo: '',
        videoDuration: '',
        colorIcons: '',
        textLogo: '',
        primaryColor: '',
        secondaryColor: '',
    }, {
        name: 'Midnight Blue',
        gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        textColor: '#ffffff',
        raised: '#f00',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Forest Green',
        gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Sunset Orange',
        gradient: 'linear-gradient(135deg, #7c2d12, #f97316)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Royal Purple',
        gradient: 'linear-gradient(135deg, #2e1065, #4c1d95)',
        textColor: '#ffffff',
        raised: '#4c1d95',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Cherry Blossom',
        gradient: 'linear-gradient(135deg, #a9005c, #fc008f)',
        textColor: '#ffffff',
        raised: '#fc008f',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Red Dark',
        gradient: 'linear-gradient(135deg, #790909, #f70131)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Raind ',
        gradient: 'linear-gradient(90deg, #3f5efb 0%, #fc466b) 100%',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Neon',
        gradient: 'linear-gradient(273deg, #ee49fd 0%, #6175ff 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Azure',
        gradient: 'linear-gradient(273deg, #0172af 0%, #74febd 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Butterfly',
        gradient: 'linear-gradient(273deg, #ff4060 0%, #fff16a 100%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    }, {
        name: 'Colombia',
        gradient: 'linear-gradient(174deg, #fbf63f  0%, #0000bb 45%, #ff0000 99%)',
        textColor: '#ffffff',
        raised: '#303131',
        btnTranslate: '#000',
        CurrentProgressVideo: '#0f0',
        videoDuration: '#fff',
        colorIcons: '#fff',
        textLogo: '#f00',
    },];

    $ap(panelOverlay);

    // Generate theme options HTML
    const themeOptionsHTML = themes
        .map(
            (theme, index) => `
        <label >
          <div class="theme-option">
          <div class="theme-preview" style="background: ${theme.gradient};"></div>
          <input type="radio" name="theme" value="${index}" ${index === 0 ? 'checked' : ''
                }>
              <span style="${theme.name === 'Default / Reload Page' ? 'color: red; ' : ''}" class="theme-name">${theme.name}</span>
              </div>
        </label>
    `
        )
        .join('');

    const languageOptionsHTML = Object.entries(languagesTranslate)
        .map(([code, name]) => {
            const selected = code === 'en' ? 'selected' : '';
            return `<option value="${code}" ${selected}>${name}</option>`;
        })
        .join('');




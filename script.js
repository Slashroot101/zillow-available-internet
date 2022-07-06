setInterval(async () => {
  if(!this.document) return;
  const internetIdExists = document.getElementById('internetId');
  if(internetIdExists){
    return;
  }
  const documentParent = document.getElementsByClassName('hdp__sc-riwk6j-0');
  if(!documentParent){
    return;
  }
  const children = documentParent[0].children;
  let address = null;
  console.log('Searching for address');
  for(const child of children) {
    if(child.className.includes('Text-c11n-8-65-2__sc-aiai24-0 kpJbvM')){
      address = child.innerHTML;
      break;
    }
  }
  address = address.replace('&nbsp;','');
  console.log('Address found: ' + address);

  console.log('Fetching address block code');

  try {
    //block code
    // https://geo.fcc.gov/api/census/block/find?longitude=-84.44302&latitude=39.09809&format=json&showall=false&censusYear=2010
    const placeData = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=us&limit=10&access_token=pk.eyJ1IjoiZmNjIiwiYSI6ImNqYWxqOWJhczAzZWMzM212MGRldW8xZ2oifQ.iJeCRTfYlufI4pMcgXZKMQ&`, {})
    const streamedPlaceData = await placeData.json();
    const cords = streamedPlaceData.features[0].center;
    const blockCodeData = await fetch(`https://geo.fcc.gov/api/census/block/find?longitude=${cords[0]}&latitude=${cords[1]}&format=json&showall=false&censusYear=2010`);
    const code = await blockCodeData.json();
    const internet = await fetch(`https://opendata.fcc.gov/resource/hicn-aujz.json?blockcode=${code.Block.FIPS}&consumer=1`);
    const internetProviders = await internet.json();

    const summaryContainer = document.getElementsByClassName('summary-container');
    let text = '';
    for(const provider of internetProviders){
      text += `${provider.providername} (${techCodeMapper(provider.techcode)}): ${provider.maxaddown}/${provider.maxadup} <br>`
    }
    const textField = document.createElement('div');
    textField.innerHTML = text;
    textField.classList = 'hdp__sc-1xtwlux-2 eeCJL';
    textField.id = 'internetId';
    summaryContainer[0].appendChild(textField);

    console.log(internetProviders)
  } catch (err){
    console.log(err);
  }
}, 1000);


function techCodeMapper(code){
  switch(code){
    case '50':
      return 'Fiber';
    case '10':
      return 'ADSL';
    case '11':
      return 'ADSL';
    case '12':
      return 'ADSL';
    case '13':
      return 'ADSL';
    case '40':
      return 'Cable';
    case '41':
      return 'Cable';
    case '42':
      return 'Cable';
    case '43':
      return 'Cable';
    case '60':
      return 'Satellite';
    case '70':
      return 'Fixed Wireless';
  }
}

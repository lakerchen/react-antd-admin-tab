const debug = (str) => {
    let prefix = '['+(new Date()).toLocaleString()+']';
    console.log(prefix, str);
  }
  
  export default debug;
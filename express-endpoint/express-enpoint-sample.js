// Multer setup
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      var path;
      switch (req.params.asset) {
        case 'portfolio':
          path = './public/portfolios';
          break;
        default:
          path = './uploads/';
      }
      cb(null, path);
    },
    filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      var splitedFileName = file.originalname.split('.');
      cb(null, splitedFileName[splitedFileName.length - 2] + '-' + datetimestamp + '.' + splitedFileName[splitedFileName.length - 1])
    }
});
var upload = multer({ //multer settings
  storage: storage
}).single('file');
// Asset upload
/** API path that will upload the files */
app.post('/upload/:asset', function(req, res, next) {
  upload(req, res, function(err){
    if(err) {
      return next(err);
    }
    res.json({error_code: 0, err_desc: null, storedFileName: res.req.file.filename});
  })
});

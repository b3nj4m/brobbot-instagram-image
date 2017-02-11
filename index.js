// Description:
//   A way to search for images with the Instagram API.
//
// Configuration:


module.exports = function(robot) {
  robot.helpCommand("brobbot image [me] `query`", "Searches Instagram tags for `query` and returns 1st result's URL.");
  robot.helpCommand("brobbot animate [me] `query`", "Searches Instagram tags for `query` and tries to return the first video result.");

  robot.respond(/^(image|img)( me)? (.*)/i, function(msg) {
    imageMe(msg, msg.match[3], false, function(err, url) {
      if (err) {
        return msg.send('No results :(');
      }
      msg.send(url);
    });
  });

  robot.respond(/^animate( me)? (.*)/i, function(msg) {
    imageMe(msg, msg.match[2], true, function(err, url) {
      if (err) {
        return msg.send('No results :(');
      }
      msg.send(url);
    });
  });
};

function imageMe(msg, query, animated, cb) {
  //TODO animated/video
  query = encodeURIComponent(query.replace(/\s/g, ''));

  msg.http('https://www.instagram.com/explore/tags/' + query + '/?__a=1')
    .get()(function(err, res, body) {
      var images;

      if (err) {
        return cb(err);
      }

      try {
        images = JSON.parse(body).tag.media.nodes;
      }
      catch (err) {
        return cb(err);
      }

      if (images.length === 0) {
        return cb(new Error());
      }

      images = filterAnimated(images, animated);

      image = msg.random(images);
      cb(null, ensureImageExtension(image.display_src));
    });
}

function filterAnimated(images, animated) {
  animated = !!animated;
  var result = [];
  for (var i in images) {
    if (images[i].is_video === animated) {
      result.push(images[i]);
    }
  }
  return result;
}

function ensureImageExtension(url) {
  var ext = url.split('.').pop();
  if (/(png|jpe?g|gif)/i.test(ext)) {
    return url;
  }
  else {
    return url + "#.png";
  }
}

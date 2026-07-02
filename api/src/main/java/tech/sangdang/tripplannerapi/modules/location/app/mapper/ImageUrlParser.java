package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class ImageUrlParser {

  private static final Pattern WIKIMEDIA_COMMONS_FILE_URL =
      Pattern.compile(
          "https?://commons\\.wikimedia\\.org/wiki/File:(.+)",
          Pattern.CASE_INSENSITIVE);

  private ImageUrlParser() {}

  static String parseImageUrl(String url) {
    if (url == null || url.isBlank()) {
      return url;
    }

    String trimmedUrl = url.trim();
    Matcher matcher = WIKIMEDIA_COMMONS_FILE_URL.matcher(trimmedUrl);
    if (!matcher.matches()) {
      return trimmedUrl;
    }

    return toWikimediaUploadUrl(matcher.group(1));
  }

  private static String toWikimediaUploadUrl(String rawFileName) {
    String fileName =
        URLDecoder.decode(rawFileName, StandardCharsets.UTF_8).replace(' ', '_');

    String hash = md5Hex(fileName);

    return "https://upload.wikimedia.org/wikipedia/commons/"
        + hash.charAt(0)
        + '/'
        + hash.substring(0, 2)
        + '/'
        + fileName;
  }

  private static String md5Hex(String value) {
    try {
      MessageDigest digest = MessageDigest.getInstance("MD5");
      byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
      StringBuilder hex = new StringBuilder(hashBytes.length * 2);

      for (byte hashByte : hashBytes) {
        hex.append(String.format("%02x", hashByte));
      }

      return hex.toString();
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("MD5 algorithm is unavailable", ex);
    }
  }
}

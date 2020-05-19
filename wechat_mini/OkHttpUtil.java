package io.renren.modules.utils;

import com.alibaba.fastjson.JSONObject;
import okhttp3.*;

import java.io.IOException;

public class OkHttpUtil {

    private static OkHttpClient client = new OkHttpClient();

    public static String sendGet(String url, String param) throws IOException {
//        JSONObject jsonObject = null;
        String responseStr = null;
        String urlNameString = url + "?" + param;
        Request request = new Request.Builder()
                .url(urlNameString)
                .addHeader("accept", "*/*")
//                .addHeader("connection", "Keep-Alive")
                .addHeader("user-agent",
                        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)")
                .build();

        Response response = client.newCall(request).execute();
        if (response.isSuccessful()) {
            responseStr = response.body().string();
//            jsonObject = JSON.parseObject(responseStr);
        }
//        return jsonObject;
        return responseStr;
    }

    public static String sendPost(String url, JSONObject param) throws IOException {
//        JSONObject jsonObject = null;
        String responseStr = null;
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");

        RequestBody body = RequestBody.create(JSON, param.toJSONString());


        Request request = new Request.Builder()
                .url(url)
                .addHeader("accept", "*/*")
//                .addHeader("connection", "Keep-Alive")
                .addHeader("user-agent",
                        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)")
                .addHeader("content-type", "application/json;charset:utf-8")
                .post(body)
                .build();

        Response response = client.newCall(request).execute();
        if (response.isSuccessful()) {
            responseStr = response.body().string();
        }
        return responseStr;
    }

    public static void sendGetAsynchronous(String url, String param,Callback callback) throws IOException {
//        JSONObject jsonObject = null;
        String urlNameString = url + "?" + param;
        Request request = new Request.Builder()
                .url(urlNameString)
                .addHeader("accept", "*/*")
//                .addHeader("connection", "Keep-Alive")
                .addHeader("user-agent",
                        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)")
                .build();

//        Response response = client.newCall(request).execute();
        Call call = client.newCall(request);
        call.enqueue(callback);

//        if (response.isSuccessful()) {
//            responseStr = response.body().string();
////            jsonObject = JSON.parseObject(responseStr);
//        }
//        return jsonObject;
    }

    public  static void sendPostAsynchronous(String url, JSONObject param,Callback callback) throws IOException {
//        JSONObject jsonObject = null;
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");

        RequestBody body = RequestBody.create(JSON, param.toJSONString());


        Request request = new Request.Builder()
                .url(url)
                .addHeader("accept", "*/*")
//                .addHeader("connection", "Keep-Alive")
                .addHeader("user-agent",
                        "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)")
                .addHeader("content-type", "application/json;charset:utf-8")
                .post(body)
                .build();

        Call call = client.newCall(request);
        call.enqueue(callback);
//        if (response.isSuccessful()) {
//            responseStr = response.body().string();
//        }
//        return responseStr;
    }

}

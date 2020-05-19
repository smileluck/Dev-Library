package io.renren.modules.utils;

import java.util.Calendar;

public class SelfNumberUtil {
    public static int getid() {
        int ymd = Integer.parseInt(Getrandom(9));

        try {
            Calendar calendar = Calendar.getInstance();
            String year = calendar.get(Calendar.YEAR) + "";
            String nowday = year.substring(2, 4) + calendar.get(Calendar.DAY_OF_MONTH);
            nowday = nowday.substring(1, 4);
            nowday = nowday + Getrandom(6);
            ymd = Integer.parseInt(nowday);
            return ymd;
        } catch (Exception var2) {
            return ymd;
        }
    }

    public static String Getrandom(int i) {
        try {
            long t = 10L;

            for (int j = 1; j < i; ++j) {
                t *= 10L;
            }

            String str;
            for (str = String.valueOf(Math.round(Math.random() * (double) t)); str.length() < i; str = String.valueOf(Math.round(Math.random() * (double) t))) {
                ;
            }

            return str;
        } catch (Exception var4) {
            return "";
        }
    }
}

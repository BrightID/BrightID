package com.brightid;

import android.app.Application;

import com.facebook.react.ReactApplication;
<<<<<<< HEAD:BrightID/android/app/src/main/java/com/brightid/MainApplication.java
import com.oblador.vectoricons.VectorIconsPackage;
=======
>>>>>>> brightId/master:BrightID-rn/android/app/src/main/java/com/brightid/MainApplication.java
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.BV.LinearGradient.LinearGradientPackage;
<<<<<<< HEAD:BrightID/android/app/src/main/java/com/brightid/MainApplication.java
import org.reactnative.camera.RNCameraPackage;
=======
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.bitgo.randombytes.RandomBytesPackage;
>>>>>>> brightId/master:BrightID-rn/android/app/src/main/java/com/brightid/MainApplication.java
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
<<<<<<< HEAD:BrightID/android/app/src/main/java/com/brightid/MainApplication.java
            new VectorIconsPackage(),
=======
>>>>>>> brightId/master:BrightID-rn/android/app/src/main/java/com/brightid/MainApplication.java
            new SvgPackage(),
            new VectorIconsPackage(),
            new RNSpinkitPackage(),
<<<<<<< HEAD:BrightID/android/app/src/main/java/com/brightid/MainApplication.java
            new RandomBytesPackage(),
            new LinearGradientPackage(),
            new RNCameraPackage()
=======
            new LinearGradientPackage(),
            new PickerPackage(),
            new RNCameraPackage(),
            new RandomBytesPackage()
>>>>>>> brightId/master:BrightID-rn/android/app/src/main/java/com/brightid/MainApplication.java
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}

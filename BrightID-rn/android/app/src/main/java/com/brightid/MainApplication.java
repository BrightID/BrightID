package com.brightid;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.bitgo.randombytes.RandomBytesPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.oney.WebRTCModule.WebRTCModulePackage; 
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
            new RandomBytesPackage(),
            new VectorIconsPackage(),
            new RNSpinkitPackage(),
            new LinearGradientPackage(),
            new PickerPackage(),
            new RNCameraPackage(),
            new WebRTCModulePackage()
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

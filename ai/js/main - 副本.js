document.addEventListener("DOMContentLoaded", async function () {
  var acceptBtn = document.getElementById("cookie-accept");
  var banner = document.getElementById("cookie-banner");
  if (!acceptBtn || !banner) return;
  acceptBtn.onclick = function () {
    banner.style.display = "none";
    document.cookie = "cookieAccepted=true; path=/; max-age=31536000";
  };
  if (document.cookie.indexOf("cookieAccepted=true") !== -1) {
    banner.style.display = "none";
  }

  var btn = document.querySelector(".btn");
  var modal = document.getElementById("ai-modal");
  var progress = [
    document.getElementById("bar-1"),
    document.getElementById("bar-2"),
    document.getElementById("bar-3"),
  ];
  var aiProgress = document.getElementById("ai-progress");
  var aiResult = document.getElementById("ai-result");
  var chatBtn = document.getElementById("chat-btn");

  // Global variables
  window.tokenId = null;
  window.endurl = null;

  // 移除加载动画的函数
  function removeLoadingOverlay() {
    var loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }

  // 保存 URL 参数为对象
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const paramObj = {};
    params.forEach((value, key) => {
      paramObj[key] = value;
    });
    console.log("URL 参数对象:", paramObj);
    return paramObj;
  }

  if (
    btn &&
    modal &&
    progress[0] &&
    progress[1] &&
    progress[2] &&
    aiProgress &&
    aiResult &&
    chatBtn
  ) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      var oldText = btn.textContent;
      btn.textContent = "Analyzing...";
      btn.disabled = true;
      btn.style.opacity = "0.7";
      gtag('event', 'Bdd');
      setTimeout(function () {
        btn.textContent = oldText;
        btn.disabled = false;
        btn.style.opacity = "";
      }, 1500);

      modal.style.display = "block";
      aiProgress.style.display = "block";
      aiResult.style.display = "none";
      progress.forEach(function (bar) {
        bar.style.width = "0%";
      });
      var t = 0,
        interval = 30,
        duration = 1500;
      var timer = setInterval(function () {
        t += interval;
        var percent = Math.min(100, Math.round((t / duration) * 100));
        progress[0].style.width = percent + "%";
        if (percent > 33) progress[1].style.width = (percent - 33) * 1.5 + "%";
        if (percent > 66) progress[2].style.width = (percent - 66) * 3 + "%";
        if (t >= duration) {
          clearInterval(timer);
          progress.forEach(function (bar) {
            bar.style.width = "100%";
          });
          setTimeout(function () {
            aiProgress.style.display = "none";
            aiResult.style.display = "block";
          }, 200);
        }
      }, interval);
    });

    // 自动请求 /api/tokenId 接口
    try {
      const urlParams = getUrlParams();
      const queryString = new URLSearchParams(urlParams).toString();
      console.log("附加到请求的查询字符串:", queryString);
      
      // First request to get tokenId
      const tokenResponse = await fetch(`/api/tokenId?${queryString}`);
      if (!tokenResponse.ok) {
        console.error("tokenId 接口请求失败:", tokenResponse.status);
        return;
      }
      const tokenData = await tokenResponse.json();
      window.tokenId = tokenData.clickId;
      console.log("保存的 tokenId:", window.tokenId);
      
      if (window.tokenId) {
        // Second request to get endurl using tokenId
        const endUrlResponse = await fetch(`/api/endurl?tokenId=${window.tokenId}`);
        if (!endUrlResponse.ok) {
          console.error("endurl 接口请求失败:", endUrlResponse.status);
          return;
        }
        const endUrlData = await endUrlResponse.json();
        window.endurl = endUrlData.data.redirectUrl;
        console.log("保存的 endurl:", window.endurl);
        removeLoadingOverlay();
      } else {
        console.error("未获取到 tokenId");
      }
    } catch (error) {
      console.error("接口请求错误:", error);
    }

    chatBtn.addEventListener("click", function () {
      if (window.endurl) {
        console.log("跳转链接:", window.endurl);
        gtag_report_conversion(window.endurl);
      } else {
        console.error("endurl 未定义");
      }
    });
  }
});
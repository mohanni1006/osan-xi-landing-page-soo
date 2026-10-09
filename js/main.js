// 1. Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mainHeader = document.getElementById('main-header');
if (menuToggle && mainHeader) {
  menuToggle.addEventListener('click', function() {
    mainHeader.classList.toggle('mobile-active');
  });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (mainHeader) mainHeader.classList.remove('mobile-active');
  });
});

// 2. 자동 슬라이드
let currentSlide = 0;
const slides = document.querySelectorAll('.slide-item');
const indicators = document.querySelectorAll('.slider-indicators .indicator');
const totalSlides = slides.length;
let slideTimer = null;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
  indicators.forEach((ind, i) => {
    ind.classList.toggle('active', i === index);
  });
  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % totalSlides;
  showSlide(nextIndex);
}

function startSlideInterval() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(nextSlide, 2000);
}

function goToSlide(index) {
  showSlide(index);
  startSlideInterval();
}

// 3. FAQ Accordion Toggle
function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('open');
}

// 4. Phone Auto-hyphen
const phoneInput = document.getElementById('formPhone');
if (phoneInput) {
  phoneInput.addEventListener('input', function(e) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7) {
      val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    }
    e.target.value = val;
  });
}

// 5. 팝업창 제어
function openPopup() {
  const modal = document.getElementById('popupModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closePopup() {
  const modal = document.getElementById('popupModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 6. 페이지 로드 초기화 (과거 날짜 선택 제한 포함)
window.addEventListener('DOMContentLoaded', function() {
  openPopup();
  showSlide(0);
  startSlideInterval();

  // 방문 예약 일자: 오늘 이전 과거 날짜 비활성화
  const dateInput = document.getElementById('formVisitDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
});

// 7. 문자(SMS) 자동 발송 엔진 (90바이트 이하 최적화 / 관리자 010-9189-1006 수신)
async function sendSmsNotification(data) {
  const ADMIN_PHONE = "010-9189-1006";
  
  // 👉 90바이트 이내로 맞춘 단문 SMS 양식
  let smsMessage = `[자이예약] ${data.name} ${data.phone}\n방문: ${data.visitDate} ${data.visitTime}\n타입: ${data.interest}`;
  if (data.memo && data.memo !== '없음') {
    smsMessage += `\n메모: ${data.memo}`;
  }

  const SMS_WEBHOOK_URL = "https://hook.us2.make.com/vmktbinzhx4s14vsoc1lsmanvj7rgsra"; 

  if (!SMS_WEBHOOK_URL) {
    console.log("ℹ️ SMS 웹후크 URL 미입력 (콘솔 시뮬레이션):\n" + smsMessage);
    return;
  }

  try {
    await fetch(SMS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient: ADMIN_PHONE,
        message: smsMessage,
        data: data
      })
    });
  } catch (err) {
    console.warn("SMS 전송 알림 지연:", err);
  }
}

// 8. 디스코드 및 문자 전송 처리 엔진
async function submitReservation(event) {
  event.preventDefault();

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1558008459817910315/3B2ixHJ0JzgeahYnsbQRbHzpatsorbUquI0gEAwYiFiBk0a0nVLHxIuTtrXN4yCGKQW0";

  const agree = document.getElementById('formAgree').checked;
  if (!agree) {
    alert('개인정보 수집 및 이용 동의에 체크해 주세요.');
    return;
  }

  const name = document.getElementById('formName').value.trim();
  const phone = document.getElementById('formPhone').value.trim();
  const visitDate = document.getElementById('formVisitDate').value;
  const visitTime = document.getElementById('formVisitTime').value;
  const interest = document.getElementById('formInterestType').value;
  const memo = document.getElementById('formMemo').value.trim() || '없음';
  const submitTime = new Date().toLocaleString('ko-KR');

  if (!name || !phone || !visitDate || !visitTime) {
    alert('성함, 전화번호, 방문 예약 일자 및 시간을 모두 선택해 주세요.');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = '상담 접수 전송 중...';

  const reservationData = {
    name: name,
    phone: phone,
    visitDate: visitDate,
    visitTime: visitTime,
    interest: interest,
    memo: memo,
    submitTime: submitTime
  };

  const discordPayload = {
    username: "오산헤리티지자이 알림봇",
    embeds: [
      {
        title: "📢 [김현수] 신규 방문예약 접수 완료!",
        color: 12951641,
        fields: [
          { name: "👤 고객 성함", value: `**${name}**`, inline: true },
          { name: "📞 전화번호", value: `**${phone}**`, inline: true },
          { name: "📅 방문 일자", value: visitDate, inline: true },
          { name: "⏰ 방문 시간", value: visitTime, inline: true },
          { name: "🏠 관심 평형", value: interest, inline: true },
          { name: "📝 문의 내용", value: memo, inline: false },
          { name: "⏱ 접수 일시", value: submitTime, inline: false }
        ],
        footer: {
          text: "오산헤리티지자이 공식 분양홍보관 (대표문의: 010-9189-1006)"
        }
      }
    ]
  };

  try {
    const [discordRes] = await Promise.all([
      fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(discordPayload)
      }),
      sendSmsNotification(reservationData)
    ]);

    if (discordRes.ok || discordRes.status === 204) {
      alert("방문 예약이 정상 접수되었습니다.\n담당자(김현수)가 예약 일시 확인 후 신속히 안내 연락드리겠습니다.");
      document.getElementById('consultForm').reset();
    } else {
      const errText = await discordRes.text();
      alert("디스코드 전송 실패 (코드: " + discordRes.status + ")\n" + errText);
    }
  } catch (err) {
    alert("네트워크 통신 오류가 발생했습니다.\n" + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = '상담 예약 신청';
  }
}

// 9. 플로팅 스피드 다이얼 메뉴 토글
function toggleFloatingMenu(forceState) {
  const container = document.getElementById('floatingNavContainer');
  if (!container) return;
  if (typeof forceState === 'boolean') {
    container.classList.toggle('open', forceState);
  } else {
    container.classList.toggle('open');
  }
}

// 10. 다이렉트 문자(SMS) 연결 (단문 최적화)
function openDirectSms() {
  const ADMIN_PHONE = "010-9189-1006";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    window.location.href = `sms:${ADMIN_PHONE}${separator}body=${encodeURIComponent('[오산자이] 상담 문의합니다.')}`;
  } else {
    alert(`모바일 기기에서 터치하시면 바로 문자(SMS) 전송 화면으로 연결됩니다.\n연락처: ${ADMIN_PHONE}`);
  }
}

// 플로팅 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
  const container = document.getElementById('floatingNavContainer');
  if (container && container.classList.contains('open')) {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  }
});
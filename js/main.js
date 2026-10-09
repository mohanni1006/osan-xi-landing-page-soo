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

// 4. Custom Time Slot Toggle
function checkCustomTime(select) {
  const customGroup = document.getElementById('customTimeGroup');
  if (select.value === 'custom') {
    customGroup.style.display = 'block';
    document.getElementById('formCustomTime').focus();
  } else {
    customGroup.style.display = 'none';
  }
}

// 5. Phone Auto-hyphen
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

// 6. 팝업창 제어
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

// 7. 페이지 로드 초기화
window.addEventListener('DOMContentLoaded', function() {
  openPopup();
  showSlide(0);
  startSlideInterval();
});

// 8. 문자 자동 발송 엔진 (기존 smsMessage 부분만 교체)
async function sendSmsNotification(data) {
  const ADMIN_PHONE = "010-9189-1006";
  
  // 👉 불필요한 글자를 모두 제거한 90바이트(단문 SMS) 최적화 양식
  const smsMessage = `[자이예약] ${data.name} / ${data.phone}
시간: ${data.timeSlot}
타입: ${data.interest}${data.memo !== '없음' ? '\n메모: ' + data.memo : ''}`;

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

// 9. 디스코드 및 문자 전송 처리 엔진
async function submitReservation(event) {
  event.preventDefault();

  // 최신 디스코드 웹후크 URL
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1558008459817910315/3B2ixHJ0JzgeahYnsbQRbHzpatsorbUquI0gEAwYiFiBk0a0nVLHxIuTtrXN4yCGKQW0";

  const agree = document.getElementById('formAgree').checked;
  if (!agree) {
    alert('개인정보 수집 및 이용 동의에 체크해 주세요.');
    return;
  }

  const name = document.getElementById('formName').value.trim();
  const phone = document.getElementById('formPhone').value.trim();
  let timeSlot = document.getElementById('formTimeSelect').value;
  if (timeSlot === 'custom') {
    timeSlot = document.getElementById('formCustomTime').value.trim() || '직접 입력 미작성';
  }
  const interest = document.getElementById('formInterestType').value;
  const memo = document.getElementById('formMemo').value.trim() || '없음';
  const submitTime = new Date().toLocaleString('ko-KR');

  if (!name || !phone) {
    alert('이름과 전화번호를 정확히 입력해 주세요.');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = '상담 접수 전송 중...';

  const reservationData = {
    name: name,
    phone: phone,
    timeSlot: timeSlot,
    interest: interest,
    memo: memo,
    submitTime: submitTime
  };

  const discordPayload = {
    username: "오산헤리티지자이 알림봇",
    embeds: [
      {
        title: "📢 신규 상담예약 접수 완료!",
        color: 12951641,
        fields: [
          { name: "👤 고객 성함", value: `**${name}**`, inline: true },
          { name: "📞 전화번호", value: `**${phone}**`, inline: true },
          { name: "⏰ 통화 가능 시간", value: timeSlot, inline: true },
          { name: "🏠 관심 평형", value: interest, inline: true },
          { name: "📝 문의 내용", value: memo, inline: false },
          { name: "📅 신청 일시", value: submitTime, inline: false }
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
      alert("상담 예약이 정상 접수되었습니다.\n지정하신 시간대에 신속히 연락드리겠습니다.");
      document.getElementById('consultForm').reset();
      if (document.getElementById('customTimeGroup')) {
        document.getElementById('customTimeGroup').style.display = 'none';
      }
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
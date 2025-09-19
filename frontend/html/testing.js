//testing

getUserByNfc("42:b7:db:69").then(data => {
  if (data) {
    console.log("User ditemukan:", data);
    sessionStorage.setItem("datakaryawan", JSON.stringify(data));
    // simulasi pindah halaman kalau mau
    window.location.href = "mainmenu.html";
  } else {
    console.log("user tidak ditemukan");
  }
});
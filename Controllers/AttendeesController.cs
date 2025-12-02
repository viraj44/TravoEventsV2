using Microsoft.AspNetCore.Mvc;

namespace EventManagerMVC.Controllers
{
    public class AttendeesController : Controller
    {
        public IActionResult Manage()
        {
            return View();
        }

        public IActionResult Generate()
        {
            return View();
        }
    }
}

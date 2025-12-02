using Microsoft.AspNetCore.Mvc;

namespace EventManagerMVC.Controllers
{
    public class EventController : Controller
    {
        public IActionResult ListYourShows()
        {
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Create()
        {
            return View();
        }

        public IActionResult AccessPoint()
        {
            return View();
        }

    }
}
